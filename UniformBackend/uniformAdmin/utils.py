from userhub.models import QuotationRequest

def render_quotation_template(template_text: str, quotation: QuotationRequest):
    if not template_text or not quotation:
        return template_text

    data = {
        "{QUOTATION_ID}": quotation.quotation_id or "",
        "{DATE}": quotation.created_at.strftime("%d-%m-%Y") if quotation.created_at else "",
        "{DELIVERY_DATE}": quotation.delivery_date.strftime("%d-%m-%Y") if quotation.delivery_date else "",
        "{CLIENT_NAME}": quotation.company_name or "",
        "{ITEM_TYPE}": quotation.item_type or "",
        "{MATERIAL}": quotation.material or "",
        "{SIZE_QUANTITY}": quotation.size_quantity or "",
        "{NOTE}": quotation.additional_note or "",
        "{STATUS}": quotation.quotation_status.upper() if quotation.quotation_status else "",
    }

    for key, value in data.items():
        template_text = template_text.replace(key, str(value))

    return template_text
