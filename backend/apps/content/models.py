from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    content = models.TextField()
    author = models.ForeignKey(
        'members.Member',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blog_posts'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    published_at = models.DateTimeField(null=True, blank=True)
    thumbnail_image = models.ImageField(
        upload_to='blog/thumbnails/',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']
        permissions = [
            ('manage_blog_post', 'Can manage blog post'),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        # Ensure slug is unique
        original_slug = self.slug
        counter = 1
        while BlogPost.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
            self.slug = f"{original_slug}-{counter}"
            counter += 1
        super().save(*args, **kwargs)


class HeroSection(models.Model):
    LAYOUT_CHOICES = [
        ('classic', 'Classic'),
        ('left_image', 'Image Left'),
        ('right_image', 'Image Right'),
        ('overlay_dark', 'Dark Overlay'),
        ('overlay_light', 'Light Overlay'),
    ]

    TEXT_ALIGNMENT_CHOICES = [
        ('left', 'Left'),
        ('center', 'Center'),
        ('right', 'Right'),
    ]

    BUTTON_VARIANT_CHOICES = [
        ('primary', 'Primary'),
        ('outline', 'Outline'),
        ('ghost', 'Ghost'),
    ]

    title = models.CharField(max_length=200, blank=True, null=True)
    subtitle = models.TextField(blank=True)
    background_image = models.ImageField(
        upload_to='hero/backgrounds/',
        null=True,
        blank=True
    )
    button_text = models.CharField(max_length=100, blank=True)
    button_link = models.CharField(max_length=255, blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    layout = models.CharField(
        max_length=20,
        choices=LAYOUT_CHOICES,
        default='classic'
    )
    text_alignment = models.CharField(
        max_length=10,
        choices=TEXT_ALIGNMENT_CHOICES,
        default='center'
    )
    button_variant = models.CharField(
        max_length=20,
        choices=BUTTON_VARIANT_CHOICES,
        default='primary'
    )
    title_color = models.CharField(max_length=20, default='#000000')
    subtitle_color = models.CharField(max_length=20, default='#666666')
    overlay_opacity = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.50,
        validators=[MinValueValidator(0.00), MaxValueValidator(1.00)]
    )
    extra_classes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        permissions = [
            ('manage_hero_section', 'Can manage hero section'),
        ]

    def __str__(self):
        return self.title or f"Hero Section #{self.id}"

    @classmethod
    def get_active_hero(cls):
        """Get the currently active hero section based on date range and is_active flag"""
        from django.utils import timezone
        now = timezone.now()
        
        # Try to find an active hero within date range
        hero = cls.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        ).first()
        
        # If no hero with date range, get any active hero
        if not hero:
            hero = cls.objects.filter(is_active=True).first()
        
        return hero


class SocialFeedConfig(models.Model):
    PLATFORM_CHOICES = [
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('youtube', 'YouTube'),
    ]

    platform = models.CharField(
        max_length=20,
        choices=PLATFORM_CHOICES
    )
    handle_or_page_id = models.CharField(max_length=255)
    api_key_or_token = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['platform', 'handle_or_page_id']
        unique_together = ['platform', 'handle_or_page_id']
        permissions = [
            ('manage_social_feed_config', 'Can manage social feed config'),
        ]

    def __str__(self):
        return f"{self.get_platform_display()} - {self.handle_or_page_id}"
