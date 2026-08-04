import os
import sqlite3
import json
import base64
import io
import time
import secrets
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
import timm

# ---------------------------------------------------------------------------
# App Setup
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", secrets.token_hex(32))
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload
CORS(app)

DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "floraguard.db")
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "best_model_epoch_5.pt")

# ---------------------------------------------------------------------------
# PlantVillage 38 Class Names (alphabetical – matches ImageFolder ordering)
# ---------------------------------------------------------------------------
CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

# ---------------------------------------------------------------------------
# Disease Information Database
# ---------------------------------------------------------------------------
DISEASE_INFO = {
    "Apple___Apple_scab": {
        "plant_name": "Apple",
        "disease_name": "Apple Scab",
        "description": "Apple scab is a fungal disease caused by Venturia inaequalis. It produces olive-green to dark brown lesions on leaves, fruit, and sometimes twigs. Severe infections can cause early leaf drop and deformed fruit.",
        "recommendations": [
            "Apply fungicide sprays (captan or myclobutanil) beginning at bud break and continuing through wet spring weather.",
            "Rake and destroy fallen infected leaves in autumn to reduce overwintering spores.",
            "Prune trees to improve air circulation within the canopy.",
            "Plant scab-resistant apple varieties such as Liberty, Enterprise, or Freedom.",
        ],
    },
    "Apple___Black_rot": {
        "plant_name": "Apple",
        "disease_name": "Black Rot",
        "description": "Black rot is caused by the fungus Botryosphaeria obtusa. It causes leaf spots with a characteristic 'frog-eye' appearance, fruit rot, and cankers on limbs. The disease is most severe in warm, humid conditions.",
        "recommendations": [
            "Prune out all dead wood, cankers, and mummified fruit during the dormant season.",
            "Apply fungicide (captan or thiophanate-methyl) from silver tip through second cover.",
            "Maintain good tree vigor through proper fertilization and watering.",
            "Remove and destroy all infected fruit and plant debris from the orchard floor.",
        ],
    },
    "Apple___Cedar_apple_rust": {
        "plant_name": "Apple",
        "disease_name": "Cedar Apple Rust",
        "description": "Cedar apple rust is caused by Gymnosporangium juniperi-virginianae. It requires both cedar/juniper and apple trees to complete its life cycle. Bright orange-yellow spots appear on apple leaves and fruit.",
        "recommendations": [
            "Remove nearby cedar or juniper trees within a 2-mile radius if possible.",
            "Apply fungicide (myclobutanil or mancozeb) starting at pink bud stage through petal fall.",
            "Plant rust-resistant apple varieties such as Redfree, Liberty, or Freedom.",
            "Monitor cedar trees for galls in late winter and prune them off before spring rains.",
        ],
    },
    "Apple___healthy": {
        "plant_name": "Apple",
        "disease_name": "Healthy",
        "description": "This apple leaf appears healthy with no visible signs of disease. The plant shows normal coloration and structure, indicating good plant health.",
        "recommendations": [
            "Continue regular watering and balanced fertilization to maintain plant health.",
            "Monitor leaves periodically for early signs of disease or pest damage.",
            "Maintain proper pruning to ensure good air circulation.",
            "Apply preventive fungicide sprays during high-risk weather periods.",
        ],
    },
    "Blueberry___healthy": {
        "plant_name": "Blueberry",
        "disease_name": "Healthy",
        "description": "This blueberry leaf appears healthy with no visible signs of disease. The plant shows normal green coloration and healthy leaf structure.",
        "recommendations": [
            "Maintain acidic soil pH between 4.5 and 5.5 for optimal blueberry health.",
            "Provide consistent watering, especially during fruit development.",
            "Apply mulch around the base to retain moisture and suppress weeds.",
            "Prune old canes annually to encourage new productive growth.",
        ],
    },
    "Cherry_(including_sour)___Powdery_mildew": {
        "plant_name": "Cherry",
        "disease_name": "Powdery Mildew",
        "description": "Powdery mildew on cherry is caused by Podosphaera clandestina. It appears as white powdery patches on leaves, shoots, and sometimes fruit. Infected leaves may curl, distort, and drop prematurely.",
        "recommendations": [
            "Apply sulfur-based or potassium bicarbonate fungicides at first sign of infection.",
            "Prune trees to improve air circulation and light penetration.",
            "Avoid overhead irrigation; water at the base of the tree instead.",
            "Remove and destroy infected plant material promptly.",
        ],
    },
    "Cherry_(including_sour)___healthy": {
        "plant_name": "Cherry",
        "disease_name": "Healthy",
        "description": "This cherry leaf appears healthy with no visible signs of disease. The leaf shows normal coloration and structure.",
        "recommendations": [
            "Continue regular care with balanced fertilization and consistent watering.",
            "Monitor for common cherry pests such as aphids and cherry fruit flies.",
            "Prune to maintain open canopy structure for air circulation.",
            "Apply preventive fungicide during prolonged wet periods.",
        ],
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "plant_name": "Corn (Maize)",
        "disease_name": "Cercospora Leaf Spot (Gray Leaf Spot)",
        "description": "Gray leaf spot is caused by Cercospora zeae-maydis. It produces rectangular, grayish-tan lesions that run parallel to leaf veins. Severe infections can significantly reduce yield by destroying photosynthetic leaf area.",
        "recommendations": [
            "Plant resistant corn hybrids recommended for your region.",
            "Rotate crops with non-host plants (soybeans, small grains) for at least one year.",
            "Till crop residue to accelerate decomposition of infected debris.",
            "Apply foliar fungicides (strobilurin or triazole) at early tasseling if disease pressure is high.",
        ],
    },
    "Corn_(maize)___Common_rust_": {
        "plant_name": "Corn (Maize)",
        "disease_name": "Common Rust",
        "description": "Common rust is caused by Puccinia sorghi. It produces small, circular to elongated, cinnamon-brown pustules on both leaf surfaces. Heavy infections can reduce photosynthesis and yield.",
        "recommendations": [
            "Plant rust-resistant corn hybrids to minimize infection risk.",
            "Apply fungicide (triazole or strobilurin) if rust appears before tasseling and conditions favor spread.",
            "Scout fields regularly during warm, humid weather for early detection.",
            "Ensure good plant nutrition to help plants tolerate mild infections.",
        ],
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "plant_name": "Corn (Maize)",
        "disease_name": "Northern Leaf Blight",
        "description": "Northern leaf blight is caused by Exserohilum turcicum. It produces large, cigar-shaped, grayish-green to tan lesions on leaves. Severe infections can cause significant yield loss.",
        "recommendations": [
            "Use corn hybrids with resistance genes (Ht1, Ht2, Ht3, or HtN).",
            "Rotate crops and manage corn residue through tillage to reduce inoculum.",
            "Apply foliar fungicide at VT (tassel) to R1 (silking) if infection is progressing.",
            "Scout fields from V8 onward, especially during cool, wet, and humid weather.",
        ],
    },
    "Corn_(maize)___healthy": {
        "plant_name": "Corn (Maize)",
        "disease_name": "Healthy",
        "description": "This corn leaf appears healthy with no visible signs of disease. The plant shows normal green coloration and healthy leaf structure.",
        "recommendations": [
            "Maintain proper nitrogen fertilization for optimal growth and yield.",
            "Ensure adequate water supply, especially during tasseling and grain fill.",
            "Scout regularly for pests such as corn borers and rootworms.",
            "Rotate crops annually to prevent soil-borne disease buildup.",
        ],
    },
    "Grape___Black_rot": {
        "plant_name": "Grape",
        "disease_name": "Black Rot",
        "description": "Grape black rot is caused by Guignardia bidwellii. It produces tan leaf spots with dark borders and causes fruit to shrivel into hard, black mummies. The disease thrives in warm, humid conditions.",
        "recommendations": [
            "Apply fungicide (myclobutanil or mancozeb) from bud break through veraison.",
            "Remove and destroy all mummified fruit from vines and the ground.",
            "Prune vines to improve air circulation and sunlight penetration.",
            "Keep the vineyard floor clean and free of fallen leaves and debris.",
        ],
    },
    "Grape___Esca_(Black_Measles)": {
        "plant_name": "Grape",
        "disease_name": "Esca (Black Measles)",
        "description": "Esca is a complex trunk disease caused by multiple fungi including Phaeomoniella and Phaeoacremonium species. It causes interveinal striping on leaves and dark spots on berries. The disease can cause sudden vine collapse.",
        "recommendations": [
            "Prune during dry weather and apply wound protectant to large pruning cuts.",
            "Remove and destroy severely affected vines to prevent spread.",
            "Avoid excessive wounding of vine trunks during cultivation.",
            "Maintain good vine nutrition and avoid water stress to increase plant resilience.",
        ],
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "plant_name": "Grape",
        "disease_name": "Leaf Blight (Isariopsis Leaf Spot)",
        "description": "Isariopsis leaf spot causes dark brown, angular lesions on grape leaves that may merge to form large blighted areas. In severe cases, premature defoliation occurs, weakening the vine.",
        "recommendations": [
            "Apply copper-based or mancozeb fungicide sprays during the growing season.",
            "Remove and destroy infected leaves to reduce inoculum sources.",
            "Ensure proper vine spacing and canopy management for good air circulation.",
            "Avoid overhead irrigation to minimize leaf wetness duration.",
        ],
    },
    "Grape___healthy": {
        "plant_name": "Grape",
        "disease_name": "Healthy",
        "description": "This grape leaf appears healthy with no visible signs of disease. The plant shows normal coloration and leaf structure.",
        "recommendations": [
            "Continue balanced fertilization and consistent irrigation practices.",
            "Maintain proper canopy management with regular pruning.",
            "Apply preventive fungicide during humid periods as a precaution.",
            "Monitor vines regularly for early signs of pests or disease.",
        ],
    },
    "Orange___Haunglongbing_(Citrus_greening)": {
        "plant_name": "Orange",
        "disease_name": "Huanglongbing (Citrus Greening)",
        "description": "Huanglongbing (HLB) is one of the most devastating citrus diseases worldwide, caused by the bacterium Candidatus Liberibacter. It is spread by the Asian citrus psyllid. Symptoms include blotchy mottling of leaves, lopsided fruit, and eventual tree decline.",
        "recommendations": [
            "Control Asian citrus psyllid populations with systemic insecticides (imidacloprid or dinotefuran).",
            "Remove and destroy infected trees to prevent spread to healthy trees.",
            "Plant certified disease-free nursery stock from reputable sources.",
            "Apply foliar nutritional sprays (micronutrients) to support tree health and manage symptoms.",
        ],
    },
    "Peach___Bacterial_spot": {
        "plant_name": "Peach",
        "disease_name": "Bacterial Spot",
        "description": "Bacterial spot of peach is caused by Xanthomonas arboricola pv. pruni. It causes small, dark, water-soaked lesions on leaves, fruit spots, and twig cankers. Severely spotted leaves may turn yellow and drop.",
        "recommendations": [
            "Apply copper-based bactericides during dormant season and at petal fall.",
            "Plant resistant peach varieties suited to your growing region.",
            "Avoid overhead irrigation and minimize leaf wetness.",
            "Prune trees to improve air circulation and remove infected shoots.",
        ],
    },
    "Peach___healthy": {
        "plant_name": "Peach",
        "disease_name": "Healthy",
        "description": "This peach leaf appears healthy with no visible signs of disease. The plant shows normal coloration and healthy growth.",
        "recommendations": [
            "Maintain regular watering and balanced fertilization for good fruit production.",
            "Prune annually to maintain open center tree shape for air circulation.",
            "Apply dormant oil spray in late winter to control overwintering pests.",
            "Thin fruit in spring to prevent branch breakage and improve fruit size.",
        ],
    },
    "Pepper,_bell___Bacterial_spot": {
        "plant_name": "Bell Pepper",
        "disease_name": "Bacterial Spot",
        "description": "Bacterial spot of pepper is caused by Xanthomonas species. It produces small, dark, water-soaked spots on leaves and raised, scab-like lesions on fruit. The disease spreads rapidly in warm, rainy conditions.",
        "recommendations": [
            "Use certified disease-free seed and transplants.",
            "Apply copper-based bactericides as a preventive spray during wet weather.",
            "Rotate crops with non-solanaceous plants for at least 2 years.",
            "Avoid working in the garden when plants are wet to prevent bacterial spread.",
        ],
    },
    "Pepper,_bell___healthy": {
        "plant_name": "Bell Pepper",
        "disease_name": "Healthy",
        "description": "This bell pepper leaf appears healthy with no visible signs of disease. The plant shows normal green coloration and vigorous growth.",
        "recommendations": [
            "Maintain consistent watering to prevent blossom end rot and stress.",
            "Provide balanced fertilizer with adequate calcium and magnesium.",
            "Stake or cage plants to support heavy fruit loads.",
            "Monitor for common pepper pests like aphids and pepper weevils.",
        ],
    },
    "Potato___Early_blight": {
        "plant_name": "Potato",
        "disease_name": "Early Blight",
        "description": "Early blight is caused by Alternaria solani. It produces dark, concentric-ringed (target-like) lesions on older leaves first, gradually moving upward. Severe infection causes significant defoliation and reduced tuber yield.",
        "recommendations": [
            "Apply fungicide (chlorothalonil or mancozeb) at first sign of disease or preventively.",
            "Practice crop rotation with non-solanaceous crops for at least 3 years.",
            "Remove and destroy infected plant debris after harvest.",
            "Ensure adequate spacing and avoid excessive nitrogen fertilization.",
        ],
    },
    "Potato___Late_blight": {
        "plant_name": "Potato",
        "disease_name": "Late Blight",
        "description": "Late blight is caused by the oomycete Phytophthora infestans. It produces dark, water-soaked lesions on leaves, stems, and tubers, often with a white mold on the underside. This was the disease responsible for the Irish Potato Famine.",
        "recommendations": [
            "Apply fungicide (chlorothalonil, mancozeb, or metalaxyl) preventively during cool, wet weather.",
            "Destroy volunteer potato plants and cull piles that harbor the pathogen.",
            "Use certified disease-free seed potatoes and resistant varieties.",
            "Improve drainage and avoid overhead irrigation to reduce leaf wetness.",
        ],
    },
    "Potato___healthy": {
        "plant_name": "Potato",
        "disease_name": "Healthy",
        "description": "This potato leaf appears healthy with no visible signs of disease. The plant shows normal green coloration and vigorous growth.",
        "recommendations": [
            "Hill soil around plants as they grow to protect developing tubers from light.",
            "Maintain consistent moisture, especially during tuber formation.",
            "Scout regularly for Colorado potato beetles and other pests.",
            "Practice crop rotation to prevent soil-borne disease buildup.",
        ],
    },
    "Raspberry___healthy": {
        "plant_name": "Raspberry",
        "disease_name": "Healthy",
        "description": "This raspberry leaf appears healthy with no visible signs of disease. The plant shows normal coloration and healthy leaf structure.",
        "recommendations": [
            "Remove spent floricanes after harvest to improve air circulation.",
            "Provide trellising to keep canes upright and improve light exposure.",
            "Apply mulch to conserve moisture and suppress weeds.",
            "Fertilize in early spring with balanced fertilizer for vigorous growth.",
        ],
    },
    "Soybean___healthy": {
        "plant_name": "Soybean",
        "disease_name": "Healthy",
        "description": "This soybean leaf appears healthy with no visible signs of disease. The plant shows normal coloration and growth pattern.",
        "recommendations": [
            "Monitor for soybean aphids and other pests during reproductive stages.",
            "Ensure proper inoculation with Bradyrhizobium for nitrogen fixation.",
            "Rotate with non-legume crops to break pest and disease cycles.",
            "Scout for common diseases during warm, humid weather periods.",
        ],
    },
    "Squash___Powdery_mildew": {
        "plant_name": "Squash",
        "disease_name": "Powdery Mildew",
        "description": "Powdery mildew on squash is caused by Podosphaera xanthii or Erysiphe cichoracearum. White, powdery fungal growth covers leaf surfaces, reducing photosynthesis and potentially causing leaf death.",
        "recommendations": [
            "Apply potassium bicarbonate, sulfur, or neem oil at first sign of infection.",
            "Plant resistant squash varieties when available.",
            "Ensure adequate plant spacing for good air circulation.",
            "Avoid late-season overhead irrigation; water at the base of plants.",
        ],
    },
    "Strawberry___Leaf_scorch": {
        "plant_name": "Strawberry",
        "disease_name": "Leaf Scorch",
        "description": "Leaf scorch is caused by the fungus Diplocarpon earlianum. It produces small, dark purple spots on the upper leaf surface that enlarge and merge, giving a scorched appearance. Severe infections weaken the plant.",
        "recommendations": [
            "Apply fungicide (captan or copper-based) starting at bloom and continuing through harvest.",
            "Remove and destroy infected leaves and plant debris.",
            "Renovate strawberry beds after harvest by mowing and thinning.",
            "Plant resistant varieties and ensure good air circulation between rows.",
        ],
    },
    "Strawberry___healthy": {
        "plant_name": "Strawberry",
        "disease_name": "Healthy",
        "description": "This strawberry leaf appears healthy with no visible signs of disease. The plant shows normal green coloration and vigorous growth.",
        "recommendations": [
            "Maintain straw mulch around plants to keep fruit clean and conserve moisture.",
            "Remove runners regularly to maintain plant vigor and fruit size.",
            "Provide consistent watering, especially during fruit development.",
            "Renovate beds annually to control disease and maintain productivity.",
        ],
    },
    "Tomato___Bacterial_spot": {
        "plant_name": "Tomato",
        "disease_name": "Bacterial Spot",
        "description": "Bacterial spot is caused by Xanthomonas species. Small, dark, water-soaked lesions appear on leaves and fruit. In severe cases, leaves yellow and drop, exposing fruit to sunscald.",
        "recommendations": [
            "Use disease-free seed and transplants from trusted sources.",
            "Apply copper-based sprays preventively during warm, wet weather.",
            "Avoid overhead watering and minimize leaf wetness duration.",
            "Rotate crops with non-solanaceous plants for 2-3 years.",
        ],
    },
    "Tomato___Early_blight": {
        "plant_name": "Tomato",
        "disease_name": "Early Blight",
        "description": "Early blight is caused by Alternaria solani. It produces dark, concentric-ringed (target-shaped) spots on lower leaves first. Severe infections cause significant defoliation and reduced fruit quality.",
        "recommendations": [
            "Apply fungicide (chlorothalonil or copper) when first symptoms appear on lower leaves.",
            "Mulch around plants to prevent soil splash onto lower leaves.",
            "Stake or cage tomatoes to improve air circulation and keep foliage off the ground.",
            "Remove and destroy infected lower leaves as the disease progresses.",
        ],
    },
    "Tomato___Late_blight": {
        "plant_name": "Tomato",
        "disease_name": "Late Blight",
        "description": "Late blight is caused by Phytophthora infestans. It produces large, dark, water-soaked lesions on leaves and stems with white fuzzy growth on the underside. It can destroy an entire crop within days.",
        "recommendations": [
            "Apply fungicide (chlorothalonil or copper) immediately at first sign; repeat every 5-7 days.",
            "Remove and destroy all infected plants promptly to prevent spread.",
            "Avoid overhead irrigation and water early in the day.",
            "Plant resistant varieties and use certified disease-free transplants.",
        ],
    },
    "Tomato___Leaf_Mold": {
        "plant_name": "Tomato",
        "disease_name": "Leaf Mold",
        "description": "Tomato leaf mold is caused by Passalora fulva (formerly Cladosporium fulvum). Pale greenish-yellow spots appear on upper leaf surfaces with olive-green to grayish-brown velvety mold underneath. Common in greenhouses.",
        "recommendations": [
            "Improve ventilation in greenhouses by increasing spacing and airflow.",
            "Reduce humidity by watering at the base and avoiding evening irrigation.",
            "Apply fungicide (chlorothalonil or copper) if infection is progressing.",
            "Plant leaf mold-resistant tomato varieties for greenhouse production.",
        ],
    },
    "Tomato___Septoria_leaf_spot": {
        "plant_name": "Tomato",
        "disease_name": "Septoria Leaf Spot",
        "description": "Septoria leaf spot is caused by Septoria lycopersici. It produces many small, circular spots with dark borders and gray centers containing tiny black dots (pycnidia). Lower leaves are affected first.",
        "recommendations": [
            "Apply fungicide (chlorothalonil or mancozeb) at first sign of disease.",
            "Remove infected lower leaves to slow the spread upward through the canopy.",
            "Mulch around plants to reduce soil splash and spore dispersal.",
            "Rotate tomato planting areas and clean up all crop debris after harvest.",
        ],
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "plant_name": "Tomato",
        "disease_name": "Spider Mites (Two-Spotted Spider Mite)",
        "description": "Two-spotted spider mites (Tetranychus urticae) cause stippling and yellowing of leaves. Heavy infestations produce visible webbing and can cause leaf drop. They thrive in hot, dry conditions.",
        "recommendations": [
            "Spray plants with a strong stream of water to dislodge mites from leaf undersides.",
            "Apply insecticidal soap or neem oil, ensuring thorough coverage of leaf undersides.",
            "Introduce predatory mites (Phytoseiulus persimilis) for biological control.",
            "Avoid broad-spectrum insecticides that kill natural predators of spider mites.",
        ],
    },
    "Tomato___Target_Spot": {
        "plant_name": "Tomato",
        "disease_name": "Target Spot",
        "description": "Target spot is caused by Corynespora cassiicola. It produces circular, brown lesions with concentric rings on leaves, stems, and fruit. The disease is favored by warm, humid conditions.",
        "recommendations": [
            "Apply fungicide (chlorothalonil or mancozeb) when conditions favor disease development.",
            "Improve air circulation by proper staking, pruning, and plant spacing.",
            "Remove and destroy infected plant debris from the garden.",
            "Avoid overhead irrigation and water at the base of plants.",
        ],
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "plant_name": "Tomato",
        "disease_name": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "description": "TYLCV is transmitted by whiteflies (Bemisia tabaci). Infected plants show severe leaf curling, yellowing, and stunting. Plants infected early produce little or no fruit.",
        "recommendations": [
            "Control whitefly populations with insecticides (imidacloprid) or reflective mulches.",
            "Use resistant tomato varieties where TYLCV is prevalent.",
            "Install fine-mesh insect netting over transplants and in greenhouses.",
            "Remove and destroy infected plants immediately to reduce virus reservoirs.",
        ],
    },
    "Tomato___Tomato_mosaic_virus": {
        "plant_name": "Tomato",
        "disease_name": "Tomato Mosaic Virus (ToMV)",
        "description": "Tomato mosaic virus causes mottled light and dark green patterns on leaves, leaf distortion, and reduced fruit quality. It spreads through contaminated hands, tools, and seed.",
        "recommendations": [
            "Wash hands thoroughly with soap before handling plants, especially after smoking.",
            "Disinfect tools, stakes, and equipment with 10% bleach solution between plants.",
            "Remove and destroy infected plants; do not compost them.",
            "Plant ToMV-resistant varieties (look for 'TMV' or 'ToMV' resistance codes on seed packs).",
        ],
    },
    "Tomato___healthy": {
        "plant_name": "Tomato",
        "disease_name": "Healthy",
        "description": "This tomato leaf appears healthy with no visible signs of disease or pest damage. The plant shows normal green coloration and vigorous growth.",
        "recommendations": [
            "Continue regular watering at the base; avoid wetting the foliage.",
            "Maintain balanced fertilization with calcium to prevent blossom end rot.",
            "Stake or cage plants for good support and air circulation.",
            "Scout regularly for early signs of common tomato diseases and pests.",
        ],
    },
}

# ---------------------------------------------------------------------------
# Image Transform (matches training pipeline)
# ---------------------------------------------------------------------------
test_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# ---------------------------------------------------------------------------
# Model Loading
# ---------------------------------------------------------------------------
model = None


def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        print(f"[WARNING] Model file not found at {MODEL_PATH}")
        print("  The server will start, but predictions will fail.")
        print("  Place your best_model_epoch_5.pt file in the project root.")
        return

    print(f"Loading model from {MODEL_PATH} ...")
    checkpoint = torch.load(MODEL_PATH, map_location="cpu", weights_only=False)

    # The training notebook used timm.create_model("tresnet_m", pretrained=True)
    # which has 1000 ImageNet output classes. The head was never replaced —
    # it was fine-tuned directly with CrossEntropyLoss on 38 PlantVillage classes
    # (class indices 0–37 out of the 1000 output neurons).
    num_classes = 1000
    print(f"  Creating tresnet_m with {num_classes} output classes (ImageNet head)")

    model = timm.create_model("tresnet_m", pretrained=False, num_classes=num_classes)
    model.load_state_dict(checkpoint)
    model.eval()
    print(f"  Model loaded successfully! (using first {len(CLASS_NAMES)} classes for prediction)")


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DATABASE)
    db.execute(
        """CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at REAL NOT NULL
        )"""
    )
    db.execute(
        """CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            image_base64 TEXT NOT NULL,
            plant_name TEXT NOT NULL,
            disease_name TEXT NOT NULL,
            confidence REAL NOT NULL,
            description TEXT NOT NULL,
            recommendations TEXT NOT NULL,
            created_at REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )"""
    )
    db.commit()
    db.close()
    print("Database initialized.")


# ---------------------------------------------------------------------------
# JWT Auth
# ---------------------------------------------------------------------------
def generate_token(user_id, email, name):
    return jwt.encode(
        {
            "user_id": user_id,
            "email": email,
            "name": name,
            "exp": time.time() + 86400 * 7,  # 7 days
        },
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "") if auth_header.startswith("Bearer ") else ""
        if not token:
            return jsonify({"error": "Authentication token required"}), 401
        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            g.user_id = data["user_id"]
            g.user_email = data["email"]
            g.user_name = data["name"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token. Please log in again."}), 401
        return f(*args, **kwargs)

    return decorated


# ---------------------------------------------------------------------------
# Auth Routes
# ---------------------------------------------------------------------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not all([name, email, password]):
        return jsonify({"error": "All fields are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        return jsonify({"error": "An account with this email already exists"}), 409

    password_hash = generate_password_hash(password)
    cursor = db.execute(
        "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
        (name, email, password_hash, time.time()),
    )
    db.commit()

    token = generate_token(cursor.lastrowid, email, name)
    return jsonify({"token": token, "user": {"email": email, "name": name}}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token(user["id"], user["email"], user["name"])
    return jsonify({"token": token, "user": {"email": user["email"], "name": user["name"]}})


@app.route("/api/auth/me", methods=["GET"])
@token_required
def me():
    return jsonify({"user": {"email": g.user_email, "name": g.user_name}})


@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    new_password = data.get("newPassword", "")

    if not email or not new_password:
        return jsonify({"error": "Email and new password are required"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    db = get_db()
    user = db.execute("SELECT id, name FROM users WHERE email = ?", (email,)).fetchone()
    if not user:
        return jsonify({"error": "No account found with this email"}), 404

    password_hash = generate_password_hash(new_password)
    db.execute("UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, user["id"]))
    db.commit()

    return jsonify({"message": "Password reset successfully. You can now sign in."})


# ---------------------------------------------------------------------------
# Prediction Route
# ---------------------------------------------------------------------------
@app.route("/api/predict", methods=["POST"])
@token_required
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Please check server logs."}), 503

    data = request.get_json()
    image_data = data.get("image", "")

    if not image_data:
        return jsonify({"error": "No image provided"}), 400

    try:
        # Strip data URL prefix (e.g. "data:image/jpeg;base64,...")
        if "," in image_data:
            image_b64 = image_data.split(",", 1)[1]
        else:
            image_b64 = image_data

        # Decode and open image
        image_bytes = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Transform and run inference
        input_tensor = test_transform(image).unsqueeze(0)

        with torch.no_grad():
            output = model(input_tensor)

        # Only consider the first 38 logits (PlantVillage classes)
        plant_logits = output[:, :len(CLASS_NAMES)]
        predicted_class = torch.argmax(plant_logits, dim=1).item()
        confidence = F.softmax(plant_logits, dim=1)[0][predicted_class].item()

        # Look up class name and disease info
        class_name = CLASS_NAMES[predicted_class] if predicted_class < len(CLASS_NAMES) else f"Class_{predicted_class}"
        info = DISEASE_INFO.get(class_name, {})

        plant_name = info.get("plant_name", class_name.split("___")[0] if "___" in class_name else "Unknown")
        disease_name = info.get("disease_name", class_name.split("___")[1].replace("_", " ") if "___" in class_name else class_name)
        description = info.get("description", "Disease detected by AI model. Consult an expert for detailed analysis.")
        recommendations = info.get("recommendations", ["Consult a plant pathologist for detailed treatment recommendations."])

        # Save to database
        db = get_db()
        cursor = db.execute(
            """INSERT INTO predictions
               (user_id, image_base64, plant_name, disease_name, confidence, description, recommendations, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (g.user_id, image_data, plant_name, disease_name, confidence, description, json.dumps(recommendations), time.time()),
        )
        db.commit()

        prediction = {
            "id": str(cursor.lastrowid),
            "timestamp": int(time.time() * 1000),
            "imageUrl": image_data,
            "plantName": plant_name,
            "diseaseName": disease_name,
            "confidence": round(confidence, 4),
            "description": description,
            "recommendations": recommendations,
        }

        return jsonify({"prediction": prediction})

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# ---------------------------------------------------------------------------
# History Route
# ---------------------------------------------------------------------------
@app.route("/api/history", methods=["GET"])
@token_required
def history():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC",
        (g.user_id,),
    ).fetchall()

    predictions = []
    for row in rows:
        predictions.append(
            {
                "id": str(row["id"]),
                "timestamp": int(row["created_at"] * 1000),
                "imageUrl": row["image_base64"],
                "plantName": row["plant_name"],
                "diseaseName": row["disease_name"],
                "confidence": row["confidence"],
                "description": row["description"],
                "recommendations": json.loads(row["recommendations"]),
            }
        )

    return jsonify({"predictions": predictions})


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    init_db()
    load_model()
    print("\n--- FloraGuard AI Backend ---")
    print(f"  Database : {DATABASE}")
    print(f"  Model    : {MODEL_PATH}")
    print(f"  Server   : http://localhost:5000")
    print("-----------------------------\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
