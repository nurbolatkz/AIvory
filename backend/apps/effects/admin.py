from django.contrib import admin
from .models import Effect, EffectCategory

@admin.register(EffectCategory)
class EffectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'slug')

@admin.register(Effect)
class EffectAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'category', 'is_active', 'is_premium', 'created_at')
    list_filter = ('category', 'is_active', 'is_premium', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active', 'is_premium')