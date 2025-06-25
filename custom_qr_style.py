from PIL import Image, ImageDraw
import qrcode
import qrcode.constants
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer, SquareModuleDrawer, CircleModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_styled_qr(data, style='dot', inner_eye_style='rounded', outer_eye_style='rounded', 
                      front_color='#000000', back_color='#FFFFFF'):
    """
    Create a styled QR code with custom module and eye styles.
    
    Args:
        data: The data to encode in the QR code
        style: Module style ('dot', 'square', 'rounded')
        inner_eye_style: Inner eye style ('rounded', 'square')
        outer_eye_style: Outer eye style ('rounded', 'square')
        front_color: Foreground color (hex format)
        back_color: Background color (hex format)
    
    Returns:
        PIL Image object
    """
    
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    # Choose module drawer based on style
    if style == 'dot':
        module_drawer = CircleModuleDrawer()
    elif style == 'rounded':
        module_drawer = RoundedModuleDrawer()
    else:
        module_drawer = SquareModuleDrawer()
    
    # Convert hex colors to RGB tuples
    front_rgb = hex_to_rgb(front_color)
    back_rgb = hex_to_rgb(back_color)
    
    # Create the styled image
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=module_drawer,
        color_mask=SolidFillColorMask(back_color=back_rgb, front_color=front_rgb)
    )
    
    # For eye styling, we need to manually draw over the eyes
    if inner_eye_style == 'rounded' or outer_eye_style == 'rounded':
        img = apply_rounded_eyes(img, qr, inner_eye_style, outer_eye_style, front_rgb, back_rgb)
    
    return img

def apply_rounded_eyes(img, qr_instance, inner_eye_style, outer_eye_style, front_color, back_color):
    """
    Apply rounded eye styles to the QR code image.
    """
    # Convert to RGBA for better manipulation
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    draw = ImageDraw.Draw(img)
    
    # Get the module size
    module_size = qr_instance.box_size
    border = qr_instance.border * module_size
    
    # Eye positions (top-left, top-right, bottom-left)
    eye_positions = [
        (border, border),  # Top-left
        (border + (qr_instance.modules_count - 7) * module_size, border),  # Top-right
        (border, border + (qr_instance.modules_count - 7) * module_size)   # Bottom-left
    ]
    
    for x, y in eye_positions:
        # Draw outer eye (7x7 modules)
        if outer_eye_style == 'rounded':
            front_rgba = front_color + (255,) if len(front_color) == 3 else front_color
            back_rgba = back_color + (255,) if len(back_color) == 3 else back_color
            draw_rounded_square(draw, x, y, 7 * module_size, module_size // 2, front_rgba)
            # Clear the inner area
            draw_rounded_square(draw, x + module_size, y + module_size, 5 * module_size, module_size // 2, back_rgba)
        
        # Draw inner eye (3x3 modules)
        if inner_eye_style == 'rounded':
            inner_x = x + 2 * module_size
            inner_y = y + 2 * module_size
            front_rgba = front_color + (255,) if len(front_color) == 3 else front_color
            draw_rounded_square(draw, inner_x, inner_y, 3 * module_size, module_size // 2, front_rgba)
    
    return img

def draw_rounded_square(draw, x, y, size, radius, color):
    """
    Draw a rounded square using PIL ImageDraw.
    """
    # Draw the main rectangle
    draw.rectangle([x + radius, y, x + size - radius, y + size], fill=color)
    draw.rectangle([x, y + radius, x + size, y + size - radius], fill=color)
    
    # Draw the corners
    draw.pieslice([x, y, x + 2*radius, y + 2*radius], 180, 270, fill=color)
    draw.pieslice([x + size - 2*radius, y, x + size, y + 2*radius], 270, 360, fill=color)
    draw.pieslice([x, y + size - 2*radius, x + 2*radius, y + size], 90, 180, fill=color)
    draw.pieslice([x + size - 2*radius, y + size - 2*radius, x + size, y + size], 0, 90, fill=color)