from django.core.management.base import BaseCommand
from apps.effects.models import Effect, EffectCategory

class Command(BaseCommand):
    help = 'Create the Center Stage effect'

    def handle(self, *args, **options):
        # Create celebrity category if it doesn't exist
        celebrity_category, created = EffectCategory.objects.get_or_create(
            slug='celebrity',
            defaults={
                'name': 'Celebrity & Fame',
                'description': 'Transform yourself into a star with celebrity-style effects'
            }
        )
        
        if created:
            self.stdout.write(f'Created category: {celebrity_category.name}')
        else:
            self.stdout.write(f'Category already exists: {celebrity_category.name}')
        
        # Create the effect
        effect, created = Effect.objects.get_or_create(
            slug='center-stage',
            defaults={
                'name': 'Center Stage',
                'category': celebrity_category,
                'user_description': 'Put yourself in the spotlight! Transform any photo into an epic moment with you as the star performer in front of cheering crowds.',
                'hidden_prompt': '''Transform this image to place the main subject as the center of attention in an epic performance venue:

SCENE TRANSFORMATION:
- Place the subject on a professional stage or arena setting
- Add massive crowd of enthusiastic fans in the background (stadium filled with thousands of people)
- Create dramatic stage lighting with spotlights focused on the subject
- Add confetti, sparkles, or light effects falling from above
- Include large screens/jumbotrons showing the subject in the background
- Stadium or arena architecture with multiple tiers of seating

SUBJECT ENHANCEMENT:
- Make the subject appear confident and charismatic
- Enhance their posture to look like a performer or celebrity
- Perfect stage lighting on their face and body
- Professional photography quality with sharp focus on subject
- Maintain natural facial features and expressions

ATMOSPHERE:
- Crowd holding signs, phones, and cheering
- Concert/event atmosphere with energy and excitement
- Professional event lighting with multiple light sources
- Slight motion blur on crowd to emphasize movement and energy
- Epic, larger-than-life feeling

TECHNICAL REQUIREMENTS:
- Ultra-high resolution and detail
- Professional photography lighting
- Dramatic composition with subject as clear focal point
- Maintain original subject's clothing and general appearance
- Photorealistic style, not cartoon or artistic interpretation''',
                'strength': 0.8,
                'preserve_faces': True,
                'max_resolution': '2048x2048',
                'output_format': 'jpeg',
                'is_premium': True,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Successfully created effect: {effect.name}'))
        else:
            self.stdout.write(f'Effect already exists: {effect.name}')