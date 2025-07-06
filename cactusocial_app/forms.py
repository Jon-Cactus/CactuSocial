from django import forms
from PIL import Image
import io
from django.core.files.base import ContentFile
from .models import Profile

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['profile_picture', 'profile_picture_url', 'bio']
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 5, 'cols': 50, 'maxlength': 512}),
        }
    
    def clean_profile_picture(self):
        picture = self.cleaned_data.get('profile_picture')
        if picture:
            # check file size
            if picture.size > 8 * 1024 * 1024:
                raise forms.ValidationError("Image file too large (max 5MB).")
            img = Image.open(picture)
            img = img.resize((200, 200), Image.LANCZOS)
            output = io.BytesIO()
            img.save(output, format=img.format or "JPEG", quality=85)
            output.seek(0)
            picture.file = ContentFile(output.read(), name=picture.name)
        return picture