from django.core.management.base import BaseCommand
from django.utils import timezone
from uniformAdmin.models import Product, InspectionItem, CleaningItem, DamagedItem
from userhub.models import Order, Rental, RentalItem


class Command(BaseCommand):
    help = "Synchronizes product inventory (available, on rent, cleaning, inspection, damaged) and cleans up orphaned/returned rentals."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting inventory synchronization..."))

        # 1. Sync Rentals whose Orders are returned
        returned_orders = Order.objects.filter(status__in=['returned', 'return'])
        returned_count = 0
        for order in returned_orders:
            rental = getattr(order, 'rental', None) or Rental.objects.filter(order=order).first()
            if rental:
                if rental.status != 'returned':
                    rental.status = 'returned'
                    rental.save(update_fields=['status'])
                    returned_count += 1
                for item in rental.items.all():
                    item.is_returned = True
                    if not item.returned_quantity:
                        item.returned_quantity = item.quantity
                    item.save(update_fields=['is_returned', 'returned_quantity'])
        self.stdout.write(f"Updated {returned_count} rentals to 'returned' matching their order status.")

        # 2. Sync Rentals whose Orders are cancelled
        cancelled_orders = Order.objects.filter(status='cancelled')
        cancelled_rentals = Rental.objects.filter(order__in=cancelled_orders)
        canc_count = cancelled_rentals.count()
        cancelled_rentals.delete()
        self.stdout.write(f"Removed {canc_count} active rentals from cancelled orders.")

        # 3. Synchronize each Product
        products = Product.objects.filter(isDeleted=False)
        self.stdout.write(f"Synchronizing {products.count()} products...")

        for p in products:
            # Active rentals
            rental_items = p.rentalitem_set.filter(
                isDeleted=False,
                isActive=True,
                is_returned=False,
                is_lost=False,
                rental__isDeleted=False,
                rental__isActive=True,
                rental__status__in=['rented', 'late', 'partial_return']
            ).exclude(
                rental__order__status__in=['cancelled', 'returned']
            )

            on_rent = sum(max(0, item.quantity - (item.returned_quantity or 0)) for item in rental_items)
            total = p.total_quantity or 0
            on_rent = min(on_rent, total)  # On rent cannot physically exceed total quantity

            cleaning = sum(item.quantity for item in p.cleaning_records.filter(status='cleaning'))
            inspect = sum(insp.returned_qty for insp in InspectionItem.objects.filter(
                rental_item__product=p, result='pending'))
            damaged = sum(item.quantity for item in p.damaged_records.filter(status__in=['pending', 'repair']))

            available = max(0, total - (on_rent + cleaning + inspect + damaged))

            old_avail = p.available_quantity
            p.available_quantity = available
            p.save(update_fields=['available_quantity'])

            self.stdout.write(
                f"[{p.id}] {p.productName}: Total={total} | Avail={available} (was {old_avail}) | OnRent={on_rent} | Cleaning={cleaning} | Inspect={inspect} | Damaged={damaged}"
            )

        self.stdout.write(self.style.SUCCESS("Inventory synchronization completed successfully!"))
