# Generated by Django 5.0 on 2024-02-12 23:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('kabisote', '0010_alter_quiz_tag'),
    ]

    operations = [
        migrations.AlterField(
            model_name='quiz',
            name='created',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
