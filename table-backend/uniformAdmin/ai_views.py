import os
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .fabric import IsAdministrator
from openai import OpenAI
from .models import FAQ, FAQDescription, PrivacyPolicy, Product
from userhub.models import Order, CustomerDetails 

# Initialize OpenAI Client (Make sure OPENAI_API_KEY is in your environment variables or .env)
# The OpenAI library will automatically pick up the OPENAI_API_KEY env var
client = OpenAI()

class FAQAssistantAPIView(APIView):
    """
    POST /api/v1/ai/faq-assistant/
    Expects: {"question": "..."}
    """
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        question = request.data.get("question", "")
        if not question:
            return Response({"success": False, "message": "Question is required."}, status=400)

        # 1. Fetch Context (In a real large-scale system, use vector embeddings here)
        # For now, we will gather all FAQs and Policies since they are usually small.
        faqs = FAQ.objects.filter(isActive=True, isDeleted=False)
        faq_text = ""
        for faq in faqs:
            faq_text += f"Q: {faq.title}\n"
            for desc in faq.descriptions.filter(isActive=True, isDeleted=False):
                faq_text += f"A: {desc.description}\n"
            faq_text += "\n"

        policies = PrivacyPolicy.objects.filter(isActive=True, isDeleted=False)
        policy_text = ""
        for policy in policies:
            policy_text += f"Policy: {policy.title}\n{policy.content}\n\n"

        context = f"COMPANY FAQs:\n{faq_text}\nCOMPANY POLICIES:\n{policy_text}"

        # 2. Call OpenAI
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant for a company. Answer the user's question based ONLY on the provided FAQs and Policies. If the answer is not in the context, politely say you don't have that information. Also provide a 'confidence' score between 0 and 100 based on how well the context matches the question. Format your response as a JSON object with two keys: 'answer' (string) and 'confidence' (integer)."},
                    {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
                ],
                response_format={"type": "json_object"}
            )
            
            ai_response = response.choices[0].message.content
            result = json.loads(ai_response)
            
            return Response({
                "success": True,
                "data": {
                    "answer": result.get("answer", ""),
                    "confidence": result.get("confidence", 0),
                    "source": "Terms & Conditions" # Mocked source logic for UI
                }
            })
        except Exception as e:
            return Response({"success": False, "message": str(e)}, status=500)

class OrderLookupAPIView(APIView):
    """
    GET /api/v1/ai/order-lookup/?query=KRZ-2024-0847
    """
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        query = request.query_params.get("query", "").strip()
        if not query:
            return Response({"success": False,"statusCode":400, "message": "Query is required."}, status=400)

        # Basic lookup by order ID
        orders = Order.objects.filter(order_id__icontains=query)
        
        # If not found by ID, try finding by customer name
        if not orders.exists():
             orders = Order.objects.filter(user__customerdetails__first_name__icontains=query) | \
                      Order.objects.filter(user__customerdetails__last_name__icontains=query)

        order = orders.first()
        if not order:
             return Response({"success": False,"statusCode":200, "message": "Order not found.", "data": None},status=200)
             
        # Serialize basic read-only details
        data = {
            "order_id": order.order_id,
            "status": order.status,
            "customer_name": f"{order.user.customerdetails.first_name} {order.user.customerdetails.last_name}" if hasattr(order.user, 'customerdetails') else "Unknown",
            "total_amount": order.total_amount,
            "created_at": order.created_at,
        }
        
        return Response({
            "success": True,
            "statusCode":200,
            "data": data,
            
        },status=200)

class ProductSearchAPIView(APIView):
    """
    POST /api/v1/ai/product-search/
    Expects: {"query": "White tablecloth for 8-seat round table"}
    """
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        query = request.data.get("query", "")
        if not query:
            return Response({"success": False,"statusCode":400, "message": "Query is required."}, status=400)

        try:
            # 1. Ask OpenAI to extract filters
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a product search assistant. Extract attributes from the user's query into a JSON object with the following optional keys: 'color' (string), 'shape' (string, e.g., round, rectangle), 'type' (string, e.g., tablecloth, napkin)."},
                    {"role": "user", "content": query}
                ],
                response_format={"type": "json_object"}
            )
            
            ai_response = response.choices[0].message.content
            filters = json.loads(ai_response)
            
            # 2. Apply filters to Database
            queryset = Product.objects.filter(isActive=True, isDeleted=False)
            
            extracted = {}
            if "color" in filters and filters["color"]:
                queryset = queryset.filter(color__colorName__icontains=filters["color"])
                extracted["color"] = filters["color"]
            if "shape" in filters and filters["shape"]:
                queryset = queryset.filter(table_shape__icontains=filters["shape"])
                extracted["shape"] = filters["shape"]
            if "type" in filters and filters["type"]:
                queryset = queryset.filter(type__icontains=filters["type"])
                extracted["type"] = filters["type"]
                
            results = []
            for p in queryset[:10]: # Limit to 10 for safety
                results.append({
                    "id": p.id,
                    "productName": p.productName,
                    "price": p.price,
                    "available_quantity": p.available_quantity,
                    "image": p.ProductImage.url if p.ProductImage else None
                })
                
            return Response({
                "success": True,
                "statusCode":200,
                "data": {
                    "extracted_filters": extracted,
                    "products": results
                }
            })
        except Exception as e:
            return Response({"success": False,"statusCode":500, "message": str(e)}, status=500)

class DraftGeneratorAPIView(APIView):
    """
    POST /api/v1/ai/draft-generator/
    Expects: {"inquiry": "..."}
    """
    permission_classes = [IsAdministrator]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        inquiry = request.data.get("inquiry", "")
        if not inquiry:
            return Response({"success": False, "message": "Inquiry is required."}, status=400)

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional customer service representative for KIREIZ SPACE event rentals. Draft a polite, helpful, and concise response to the customer's inquiry."},
                    {"role": "user", "content": inquiry}
                ]
            )
            
            draft = response.choices[0].message.content
            
            return Response({
                "success": True,
                "data": {
                    "draft": draft
                }
            })
        except Exception as e:
            return Response({"success": False, "message": str(e)}, status=500)

