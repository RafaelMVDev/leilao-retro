import os
import uuid
from werkzeug.utils import secure_filename
from src.models.ImageModel import ImageModel
from setup.loaders.database import DB_SESSION

BASE_UPLOAD_FOLDER = "static/uploads/auction_pictures"

def generate_unique_filename(filename):
    ext = filename.rsplit('.', 1)[-1]
    return f"{uuid.uuid4().hex}.{ext}"

def save_product_image(file, product_id):
    filename = secure_filename(file.filename)
    unique_filename = generate_unique_filename(filename)

    product_folder = os.path.join(BASE_UPLOAD_FOLDER, f"product_{product_id}")
    os.makedirs(product_folder, exist_ok=True)

    file_path = os.path.join(product_folder, unique_filename)
    file.save(file_path)

    # Path relativo para o banco
    relative_path = f"uploads/auction_pictures/product_{product_id}/{unique_filename}"

    with DB_SESSION() as session:
        image = ImageModel(fileName=relative_path)
        session.add(image)
        session.commit()

        return image.idImage, relative_path
