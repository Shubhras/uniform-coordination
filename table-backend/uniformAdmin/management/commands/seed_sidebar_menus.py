from django.core.management.base import BaseCommand
from seed_sidebar_menus import seed_menus_and_permissions


class Command(BaseCommand):
    help = "Seeds all 16 sidebar menus and grants all permissions to the admin role."

    def handle(self, *args, **options):
        self.stdout.write("Running seed_sidebar_menus command...")
        seed_menus_and_permissions()
        self.stdout.write(self.style.SUCCESS("Successfully seeded sidebar menus and permissions."))
