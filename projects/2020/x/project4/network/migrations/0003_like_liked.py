# Generated by Django 5.0 on 2024-01-18 08:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_follow_post_like'),
    ]

    operations = [
        migrations.AddField(
            model_name='like',
            name='liked',
            field=models.BooleanField(default=False),
        ),
    ]
