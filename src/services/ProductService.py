from src.models import ProductModel, CategoryModel, CategoryProductModel
from setup.loaders.database import db, DB_SESSION

from src.models.ProductModel import ProductModel 
from src.models.ProductImageModel import ProductImageModel
from setup.loaders.database import DB_SESSION
from src.services.ImageService import save_product_image

def create_product(data,lot_id, image_files):
    with DB_SESSION() as session:
        
        product = ProductModel(
            productName=data.get("productName"),
            descriptionProduct=data.get("descriptionProduct"),
            #category=data.get("category"),
            productType=data.get("productType"),
            manufacturer=data.get("manufacturer"),
            width=data.get("width"),
            height=data.get("height"),
            weight=data.get("weight"),
            depth = data.get("depth"),
            activationKey=data.get("activationKey"),
            downloadUrl=data.get("downloadUrl"),
            downloadValidity=data.get("downloadValidity"),
            fkLotIdLot= lot_id
        )

        session.add(product)
        session.commit()  # importante pra pegar product.id

        # Salvar imagens
        for index, file in enumerate(image_files):
            image_id, path = save_product_image(file, product.idProduct)

            link = ProductImageModel(
                fkProductIdProduct=product.idProduct,
                fkImageIdImage=image_id,
                displayOrder=index
            )

            session.add(link)

        session.commit()

        return product

def get_product(product_id: int):
    return ProductModel.query.get(product_id)