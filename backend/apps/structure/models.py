from django.db import models
from django.core.validators import MinLengthValidator


class Zone(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    location_hint = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        permissions = [
            ('manage_zone', 'Can manage zone'),
            ('view_own_zone', 'Can view own zone'),
            ('manage_own_zone', 'Can manage own zone'),
        ]

    def __str__(self):
        return self.name


class ZoneGroup(models.Model):
    GROUP_TYPE_CHOICES = [
        ('children', 'Children Sunday School'),
        ('teenagers', 'Teenagers Bible Study'),
        ('parents', 'Parents Bible Study'),
    ]

    zone = models.ForeignKey(
        Zone,
        on_delete=models.CASCADE,
        related_name='zone_groups'
    )
    group_type = models.CharField(
        max_length=20,
        choices=GROUP_TYPE_CHOICES
    )
    name = models.CharField(max_length=150)

    class Meta:
        ordering = ['zone', 'group_type', 'name']
        unique_together = ['zone', 'group_type', 'name']
        permissions = [
            ('manage_zone_group', 'Can manage zone group'),
        ]

    def __str__(self):
        return f"{self.zone.name} - {self.get_group_type_display()} - {self.name}"


class ServiceDivision(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        permissions = [
            ('manage_service_division', 'Can manage service division'),
            ('view_own_service_division', 'Can view own service division'),
            ('manage_own_service_division', 'Can manage own service division'),
        ]

    def __str__(self):
        return self.name


class ZoneLeader(models.Model):
    zone = models.OneToOneField(
        Zone,
        on_delete=models.CASCADE,
        related_name='zone_leader'
    )
    member = models.ForeignKey(
        'members.Member',
        on_delete=models.CASCADE,
        related_name='zone_leaderships'
    )

    class Meta:
        ordering = ['zone', 'member']
        permissions = [
            ('manage_zone_leader', 'Can manage zone leader'),
        ]

    def __str__(self):
        return f"{self.member.full_name} - {self.zone.name} Leader"


class ServiceLeader(models.Model):
    service_division = models.OneToOneField(
        ServiceDivision,
        on_delete=models.CASCADE,
        related_name='service_leader'
    )
    member = models.ForeignKey(
        'members.Member',
        on_delete=models.CASCADE,
        related_name='service_leaderships'
    )

    class Meta:
        ordering = ['service_division', 'member']
        permissions = [
            ('manage_service_leader', 'Can manage service leader'),
        ]

    def __str__(self):
        return f"{self.member.full_name} - {self.service_division.name} Leader"
