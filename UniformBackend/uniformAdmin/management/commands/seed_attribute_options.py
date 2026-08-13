"""
Seed the size run into AttributeOption.

Admin manages sizes and nothing else for now, so this seeds the standard XS–XXXL run and
leaves collar, cuff, cap, pant, apron, pocket, zipper and sleeve to the artwork bundled in
the storefront.

Idempotent: rows are matched on (attribute, name), so re-running updates rather than
duplicates. An image an admin uploaded is never overwritten.

The artwork copying below still works, so pointing SEED at image paths is all it takes if
another attribute is handed to the admin later.

    python manage.py seed_attribute_options [--source /path/to/public] [--dry-run]
"""

import os
import shutil

from django.conf import settings
from django.core.management.base import BaseCommand

from uniformAdmin.models import AttributeOption

# The storefront public folder, relative to the repo root that holds both projects.
DEFAULT_SOURCE = "/var/www/html/uniform-coordination/uniform-kireiz-coordination/public"

# attribute -> [(option name, path under public/), ...]
# Names are what the admin and the shopper read, so they are written out rather than
# derived from the filenames.
# Only the size run. The other attributes (collar, cuff, cap, pant, apron, pocket,
# zipper, sleeve) keep the artwork bundled in the storefront — the admin manages sizes
# here and nothing else, so seeding them would put rows behind a screen that does not
# show them.
SEED = {
    "size": [
        ("XS", None), ("S", None), ("M", None), ("L", None),
        ("XL", None), ("XXL", None), ("XXXL", None),
    ],
}

MEDIA_SUBDIR = "attribute_options"


class Command(BaseCommand):
    help = "Seed AttributeOption rows from the storefront's bundled artwork."

    def add_arguments(self, parser):
        parser.add_argument("--source", default=DEFAULT_SOURCE,
                            help="Storefront public/ directory holding the artwork.")
        parser.add_argument("--dry-run", action="store_true",
                            help="Report what would happen without writing anything.")

    def handle(self, *args, **options):
        source = options["source"]
        dry_run = options["dry_run"]

        dest_dir = os.path.join(settings.MEDIA_ROOT, MEDIA_SUBDIR)
        if not dry_run:
            os.makedirs(dest_dir, exist_ok=True)

        created = updated = skipped = missing = 0

        for attribute, entries in SEED.items():
            for order, (name, rel_path) in enumerate(entries, start=1):
                image_name = None

                if rel_path:
                    src = os.path.join(source, rel_path)
                    if not os.path.isfile(src):
                        self.stderr.write(f"  missing artwork: {src}")
                        missing += 1
                        continue

                    filename = f"{attribute}_{os.path.basename(rel_path)}"
                    image_name = f"{MEDIA_SUBDIR}/{filename}"
                    if not dry_run:
                        target = os.path.join(dest_dir, filename)
                        if not os.path.exists(target):
                            shutil.copy2(src, target)

                existing = AttributeOption.objects.filter(
                    attribute=attribute, name=name, isDeleted=False
                ).first()

                if existing:
                    # Only fill a gap; an image the admin uploaded is left alone.
                    if image_name and not existing.image:
                        if not dry_run:
                            existing.image = image_name
                            existing.order = existing.order or order
                            existing.save(update_fields=["image", "order", "updated_at"])
                        updated += 1
                    else:
                        skipped += 1
                    continue

                if not dry_run:
                    AttributeOption.objects.create(
                        attribute=attribute,
                        name=name,
                        image=image_name or "",
                        order=order,
                        isActive=True,
                    )
                created += 1

        verb = "would be" if dry_run else ""
        self.stdout.write(self.style.SUCCESS(
            f"created {created} {verb}, filled image on {updated}, "
            f"left {skipped} untouched, {missing} artwork files missing"
        ))
