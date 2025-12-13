from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Member(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='member_profile',
        help_text='Link to User for staff members'
    )
    first_name = models.CharField(max_length=100)
    father_name = models.CharField(max_length=100, blank=True, help_text="Father's name")
    last_name = models.CharField(max_length=100, help_text="Grandfather's name")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True, help_text='Age in years (if date of birth is unknown)')
    use_age_instead_of_birthdate = models.BooleanField(default=False, help_text='Use age instead of date of birth')
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    zone = models.ForeignKey(
        'structure.Zone',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    service_division = models.ForeignKey(
        'structure.ServiceDivision',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members'
    )
    photo = models.ImageField(upload_to='members/photos/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff_member = models.BooleanField(default=False)
    staff_title = models.CharField(max_length=150, blank=True)
    staff_bio = models.TextField(blank=True)
    show_in_staff_page = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['last_name', 'first_name']
        permissions = [
            ('manage_member', 'Can manage member'),
            ('view_zone_members', 'Can view zone members'),
            ('manage_zone_members', 'Can manage zone members'),
            ('view_service_members', 'Can view service division members'),
            ('manage_service_members', 'Can manage service division members'),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        """Format: First Name Father's Name Last Name (Grandfather's Name)"""
        parts = [self.first_name]
        if self.father_name:
            parts.append(self.father_name)
        if self.last_name:
            parts.append(self.last_name)
        return ' '.join(parts)


class Family(models.Model):
    head_member = models.ForeignKey(
        'Member',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_families',
        help_text='Head of family (father or mother)'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Families'
        ordering = ['created_at']
        permissions = [
            ('manage_family', 'Can manage family'),
        ]

    def __str__(self):
        return self.display_name

    @property
    def display_name(self):
        """Compute family display name based on head member or family members"""
        try:
            if self.head_member:
                return f"{self.head_member.first_name}'s family"
            
            # Try to find father or mother
            family_members = self.family_members.select_related('member').all()
            
            for fm in family_members:
                if fm.relationship == 'father' and fm.member:
                    return f"{fm.member.first_name}'s family"
                elif fm.relationship == 'mother' and fm.member:
                    return f"{fm.member.first_name}'s family"
        except Exception:
            pass
        
        return "Unnamed family"

    @property
    def members_list(self):
        """Get all members in this family"""
        return [fm.member for fm in self.family_members.select_related('member').all()]


class FamilyMember(models.Model):
    RELATIONSHIP_CHOICES = [
        ('father', 'Father'),
        ('mother', 'Mother'),
        ('son', 'Son'),
        ('daughter', 'Daughter'),
        ('guardian', 'Guardian'),
        ('other', 'Other'),
    ]

    family = models.ForeignKey(
        Family,
        on_delete=models.CASCADE,
        related_name='family_members'
    )
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='family_relationships'
    )
    relationship = models.CharField(
        max_length=20,
        choices=RELATIONSHIP_CHOICES
    )

    class Meta:
        unique_together = ['family', 'member']
        ordering = ['relationship', 'member__first_name']
        permissions = [
            ('manage_family_member', 'Can manage family member'),
        ]

    def __str__(self):
        return f"{self.member.full_name} - {self.get_relationship_display()} ({self.family.display_name})"
