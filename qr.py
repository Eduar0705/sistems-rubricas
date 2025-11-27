import qrcode
from PIL import Image

url = 'https://sistems-rubricas.onrender.com'

# Crear QR con alta corrección de errores (necesario para agregar logo)
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)

qr.add_data(url)
qr.make(fit=True)

# Crear imagen del QR
img = qr.make_image(fill_color="black", back_color="white").convert('RGB')

# Abrir el logo (debe ser una imagen pequeña)
logo = Image.open("./public/img/fe.jpg")  

# Calcular el tamaño del logo (max 20% del QR)
qr_width, qr_height = img.size
logo_size = qr_width // 5
logo = logo.resize((logo_size, logo_size))

# Calcular posición para centrar el logo
logo_pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)

# Pegar el logo en el centro
img.paste(logo, logo_pos)

# Guardar
img.save("codigo_qr.png")
print("✅ Código QR con logo generado!")