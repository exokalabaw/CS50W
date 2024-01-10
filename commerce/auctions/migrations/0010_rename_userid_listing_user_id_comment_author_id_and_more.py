# Generated by Django 5.0 on 2024-01-04 08:34

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0009_listing_category_listing_listing_date_listing_status_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='listing',
            old_name='userid',
            new_name='user_id',
        ),
        migrations.AddField(
            model_name='comment',
            name='author_id',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='comment',
            name='comment_text',
            field=models.TextField(default='comment text'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='comment',
            name='listing_id',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='auctions.listing'),
            preserve_default=False,
        ),
    ]
