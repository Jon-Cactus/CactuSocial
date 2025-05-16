from django import forms
from PIL import Image
import io
from django.core.files.base import ContentFile
from .models import Profile

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['profile_picture', 'profile_picture_url', 'bio']
    
    def clean_profile_picture(self):
        picture = self.cleaned_data
        if picture:
            img = Image.open(picture)
            img = img.resize((200, 200), Image.LANCZOS)
            output = io.BytesIO()
            img.save(output, format=img.format or "JPEG", quality=85)
            output.seek(0)
            picture.file = ContentFile(output.read(), name=picture.name)
        return picture