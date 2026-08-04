import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Info, AlertTriangle, CheckCircle2, X, ArrowRight, Leaf, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface Disease {
  id: string;
  className: string;
  name: string;
  plant: string;
  isHealthy: boolean;
  symptoms: string;
  prevention: string;
  detailedInfo: string;
  careInstructions: string[];
}

const PLANT_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  Apple:      { bg: 'bg-red-50',     text: 'text-red-700',     ring: 'ring-red-200' },
  Blueberry:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  ring: 'ring-indigo-200' },
  Cherry:     { bg: 'bg-pink-50',    text: 'text-pink-700',    ring: 'ring-pink-200' },
  Corn:       { bg: 'bg-yellow-50',  text: 'text-yellow-700',  ring: 'ring-yellow-200' },
  Grape:      { bg: 'bg-purple-50',  text: 'text-purple-700',  ring: 'ring-purple-200' },
  Orange:     { bg: 'bg-orange-50',  text: 'text-orange-700',  ring: 'ring-orange-200' },
  Peach:      { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200' },
  Pepper:     { bg: 'bg-lime-50',    text: 'text-lime-700',    ring: 'ring-lime-200' },
  Potato:     { bg: 'bg-stone-100',  text: 'text-stone-700',   ring: 'ring-stone-200' },
  Raspberry:  { bg: 'bg-rose-50',    text: 'text-rose-700',    ring: 'ring-rose-200' },
  Soybean:    { bg: 'bg-teal-50',    text: 'text-teal-700',    ring: 'ring-teal-200' },
  Squash:     { bg: 'bg-green-50',   text: 'text-green-700',   ring: 'ring-green-200' },
  Strawberry: { bg: 'bg-red-50',     text: 'text-red-600',     ring: 'ring-red-200' },
  Tomato:     { bg: 'bg-red-50',     text: 'text-red-700',     ring: 'ring-red-200' },
};

function getPlantColor(plant: string) {
  for (const key of Object.keys(PLANT_COLORS)) {
    if (plant.includes(key)) return PLANT_COLORS[key];
  }
  return { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' };
}

const DISEASES: Disease[] = [
  {
    id: "apple-scab",
    className: "Apple___Apple_scab",
    name: "Apple Scab",
    plant: "Apple",
    isHealthy: false,
    symptoms: "Olive-green to dark brown lesions on leaves, fruit, and sometimes twigs. Severe infections cause early leaf drop and deformed fruit.",
    prevention: "Plant scab-resistant varieties such as Liberty, Enterprise, or Freedom. Rake and destroy fallen leaves in autumn.",
    detailedInfo: "Apple scab is caused by the fungus Venturia inaequalis. It is one of the most serious diseases of apple trees worldwide. The fungus overwinters in fallen leaves on the ground and releases spores during warm, wet spring weather.",
    careInstructions: [
      "Apply fungicide sprays (captan or myclobutanil) beginning at bud break and continuing through wet spring weather.",
      "Rake and destroy fallen infected leaves in autumn to reduce overwintering spores.",
      "Prune trees to improve air circulation within the canopy.",
      "Plant scab-resistant apple varieties such as Liberty, Enterprise, or Freedom."
    ]
  },
  {
    id: "apple-black-rot",
    className: "Apple___Black_rot",
    name: "Black Rot",
    plant: "Apple",
    isHealthy: false,
    symptoms: "Leaf spots with a characteristic 'frog-eye' appearance, fruit rot, and cankers on limbs. Most severe in warm, humid conditions.",
    prevention: "Prune out all dead wood, cankers, and mummified fruit during the dormant season.",
    detailedInfo: "Black rot is caused by the fungus Botryosphaeria obtusa. It causes leaf spots, fruit rot, and cankers on limbs. The disease is most severe in warm, humid conditions and can spread rapidly through an orchard.",
    careInstructions: [
      "Prune out all dead wood, cankers, and mummified fruit during the dormant season.",
      "Apply fungicide (captan or thiophanate-methyl) from silver tip through second cover.",
      "Maintain good tree vigor through proper fertilization and watering.",
      "Remove and destroy all infected fruit and plant debris from the orchard floor."
    ]
  },
  {
    id: "apple-cedar-rust",
    className: "Apple___Cedar_apple_rust",
    name: "Cedar Apple Rust",
    plant: "Apple",
    isHealthy: false,
    symptoms: "Bright orange-yellow spots on the upper leaf surface. Tube-like structures appear on the underside of leaves.",
    prevention: "Remove nearby cedar or juniper trees within a 2-mile radius if possible. Apply fungicide at pink bud stage.",
    detailedInfo: "Cedar apple rust is caused by Gymnosporangium juniperi-virginianae. It requires both cedar/juniper and apple trees to complete its life cycle. The fungus forms galls on cedar trees that release spores in spring.",
    careInstructions: [
      "Remove nearby cedar or juniper trees within a 2-mile radius if possible.",
      "Apply fungicide (myclobutanil or mancozeb) starting at pink bud stage through petal fall.",
      "Plant rust-resistant apple varieties such as Redfree, Liberty, or Freedom.",
      "Monitor cedar trees for galls in late winter and prune them off before spring rains."
    ]
  },
  {
    id: "apple-healthy",
    className: "Apple___healthy",
    name: "Healthy",
    plant: "Apple",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal green coloration and healthy leaf structure.",
    prevention: "Continue regular watering and balanced fertilization to maintain plant health.",
    detailedInfo: "This class represents healthy apple leaves with no visible signs of disease. The plant shows normal coloration and structure, indicating good plant health and proper care.",
    careInstructions: [
      "Continue regular watering and balanced fertilization to maintain plant health.",
      "Monitor leaves periodically for early signs of disease or pest damage.",
      "Maintain proper pruning to ensure good air circulation.",
      "Apply preventive fungicide sprays during high-risk weather periods."
    ]
  },
  {
    id: "blueberry-healthy",
    className: "Blueberry___healthy",
    name: "Healthy",
    plant: "Blueberry",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal green coloration and healthy leaf structure.",
    prevention: "Maintain acidic soil pH between 4.5 and 5.5 for optimal blueberry health.",
    detailedInfo: "This class represents healthy blueberry leaves with no visible signs of disease. The plant shows normal green coloration and healthy leaf structure.",
    careInstructions: [
      "Maintain acidic soil pH between 4.5 and 5.5 for optimal blueberry health.",
      "Provide consistent watering, especially during fruit development.",
      "Apply mulch around the base to retain moisture and suppress weeds.",
      "Prune old canes annually to encourage new productive growth."
    ]
  },
  {
    id: "cherry-powdery-mildew",
    className: "Cherry_(including_sour)___Powdery_mildew",
    name: "Powdery Mildew",
    plant: "Cherry",
    isHealthy: false,
    symptoms: "White powdery patches on leaves, shoots, and sometimes fruit. Infected leaves may curl, distort, and drop prematurely.",
    prevention: "Prune trees to improve air circulation and light penetration. Avoid overhead irrigation.",
    detailedInfo: "Powdery mildew on cherry is caused by Podosphaera clandestina. It appears as white powdery patches on leaves, shoots, and sometimes fruit. It thrives in warm, dry days followed by cool, damp nights.",
    careInstructions: [
      "Apply sulfur-based or potassium bicarbonate fungicides at first sign of infection.",
      "Prune trees to improve air circulation and light penetration.",
      "Avoid overhead irrigation; water at the base of the tree instead.",
      "Remove and destroy infected plant material promptly."
    ]
  },
  {
    id: "cherry-healthy",
    className: "Cherry_(including_sour)___healthy",
    name: "Healthy",
    plant: "Cherry",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal coloration and healthy leaf structure.",
    prevention: "Continue regular care with balanced fertilization and consistent watering.",
    detailedInfo: "This class represents healthy cherry leaves with no visible signs of disease. The leaf shows normal coloration and structure.",
    careInstructions: [
      "Continue regular care with balanced fertilization and consistent watering.",
      "Monitor for common cherry pests such as aphids and cherry fruit flies.",
      "Prune to maintain open canopy structure for air circulation.",
      "Apply preventive fungicide during prolonged wet periods."
    ]
  },
  {
    id: "corn-cercospora",
    className: "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    name: "Cercospora Leaf Spot (Gray Leaf Spot)",
    plant: "Corn (Maize)",
    isHealthy: false,
    symptoms: "Rectangular, grayish-tan lesions that run parallel to leaf veins. Severe infections can significantly reduce yield.",
    prevention: "Plant resistant corn hybrids. Rotate crops with non-host plants for at least one year.",
    detailedInfo: "Gray leaf spot is caused by Cercospora zeae-maydis. It produces rectangular, grayish-tan lesions that run parallel to leaf veins. Severe infections can significantly reduce yield by destroying photosynthetic leaf area.",
    careInstructions: [
      "Plant resistant corn hybrids recommended for your region.",
      "Rotate crops with non-host plants (soybeans, small grains) for at least one year.",
      "Till crop residue to accelerate decomposition of infected debris.",
      "Apply foliar fungicides (strobilurin or triazole) at early tasseling if disease pressure is high."
    ]
  },
  {
    id: "corn-common-rust",
    className: "Corn_(maize)___Common_rust_",
    name: "Common Rust",
    plant: "Corn (Maize)",
    isHealthy: false,
    symptoms: "Small, circular to elongated, cinnamon-brown pustules on both leaf surfaces. Heavy infections reduce photosynthesis and yield.",
    prevention: "Plant rust-resistant corn hybrids to minimize infection risk.",
    detailedInfo: "Common rust is caused by Puccinia sorghi. It produces small, circular to elongated, cinnamon-brown pustules on both leaf surfaces. It typically appears in mid-to-late summer when humidity is high.",
    careInstructions: [
      "Plant rust-resistant corn hybrids to minimize infection risk.",
      "Apply fungicide (triazole or strobilurin) if rust appears before tasseling and conditions favor spread.",
      "Scout fields regularly during warm, humid weather for early detection.",
      "Ensure good plant nutrition to help plants tolerate mild infections."
    ]
  },
  {
    id: "corn-northern-leaf-blight",
    className: "Corn_(maize)___Northern_Leaf_Blight",
    name: "Northern Leaf Blight",
    plant: "Corn (Maize)",
    isHealthy: false,
    symptoms: "Large, cigar-shaped, grayish-green to tan lesions on leaves. Severe infections can cause significant yield loss.",
    prevention: "Use corn hybrids with resistance genes (Ht1, Ht2, Ht3, or HtN).",
    detailedInfo: "Northern leaf blight is caused by Exserohilum turcicum. It produces large, cigar-shaped, grayish-green to tan lesions on leaves. The disease thrives in cool, wet, and humid weather conditions.",
    careInstructions: [
      "Use corn hybrids with resistance genes (Ht1, Ht2, Ht3, or HtN).",
      "Rotate crops and manage corn residue through tillage to reduce inoculum.",
      "Apply foliar fungicide at VT (tassel) to R1 (silking) if infection is progressing.",
      "Scout fields from V8 onward, especially during cool, wet, and humid weather."
    ]
  },
  {
    id: "corn-healthy",
    className: "Corn_(maize)___healthy",
    name: "Healthy",
    plant: "Corn (Maize)",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal green coloration and healthy leaf structure.",
    prevention: "Maintain proper nitrogen fertilization for optimal growth and yield.",
    detailedInfo: "This class represents healthy corn leaves with no visible signs of disease. The plant shows normal green coloration and healthy leaf structure.",
    careInstructions: [
      "Maintain proper nitrogen fertilization for optimal growth and yield.",
      "Ensure adequate water supply, especially during tasseling and grain fill.",
      "Scout regularly for pests such as corn borers and rootworms.",
      "Rotate crops annually to prevent soil-borne disease buildup."
    ]
  },
  {
    id: "grape-black-rot",
    className: "Grape___Black_rot",
    name: "Black Rot",
    plant: "Grape",
    isHealthy: false,
    symptoms: "Tan leaf spots with dark borders. Fruit shrivels into hard, black mummies. Thrives in warm, humid conditions.",
    prevention: "Remove and destroy all mummified fruit from vines and the ground.",
    detailedInfo: "Grape black rot is caused by Guignardia bidwellii. It produces tan leaf spots with dark borders and causes fruit to shrivel into hard, black mummies. The disease thrives in warm, humid conditions.",
    careInstructions: [
      "Apply fungicide (myclobutanil or mancozeb) from bud break through veraison.",
      "Remove and destroy all mummified fruit from vines and the ground.",
      "Prune vines to improve air circulation and sunlight penetration.",
      "Keep the vineyard floor clean and free of fallen leaves and debris."
    ]
  },
  {
    id: "grape-esca",
    className: "Grape___Esca_(Black_Measles)",
    name: "Esca (Black Measles)",
    plant: "Grape",
    isHealthy: false,
    symptoms: "Interveinal striping on leaves and dark spots on berries. Can cause sudden vine collapse.",
    prevention: "Prune during dry weather and apply wound protectant to large pruning cuts.",
    detailedInfo: "Esca is a complex trunk disease caused by multiple fungi including Phaeomoniella and Phaeoacremonium species. It causes interveinal striping on leaves and dark spots on berries. The disease can cause sudden vine collapse.",
    careInstructions: [
      "Prune during dry weather and apply wound protectant to large pruning cuts.",
      "Remove and destroy severely affected vines to prevent spread.",
      "Avoid excessive wounding of vine trunks during cultivation.",
      "Maintain good vine nutrition and avoid water stress to increase plant resilience."
    ]
  },
  {
    id: "grape-leaf-blight",
    className: "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    name: "Leaf Blight (Isariopsis Leaf Spot)",
    plant: "Grape",
    isHealthy: false,
    symptoms: "Dark brown, angular lesions on grape leaves that may merge to form large blighted areas. Premature defoliation in severe cases.",
    prevention: "Ensure proper vine spacing and canopy management for good air circulation.",
    detailedInfo: "Isariopsis leaf spot causes dark brown, angular lesions on grape leaves that may merge to form large blighted areas. In severe cases, premature defoliation occurs, weakening the vine.",
    careInstructions: [
      "Apply copper-based or mancozeb fungicide sprays during the growing season.",
      "Remove and destroy infected leaves to reduce inoculum sources.",
      "Ensure proper vine spacing and canopy management for good air circulation.",
      "Avoid overhead irrigation to minimize leaf wetness duration."
    ]
  },
  {
    id: "grape-healthy",
    className: "Grape___healthy",
    name: "Healthy",
    plant: "Grape",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal coloration and healthy leaf structure.",
    prevention: "Continue balanced fertilization and consistent irrigation practices.",
    detailedInfo: "This class represents healthy grape leaves with no visible signs of disease. The plant shows normal coloration and leaf structure.",
    careInstructions: [
      "Continue balanced fertilization and consistent irrigation practices.",
      "Maintain proper canopy management with regular pruning.",
      "Apply preventive fungicide during humid periods as a precaution.",
      "Monitor vines regularly for early signs of pests or disease."
    ]
  },
  {
    id: "orange-hlb",
    className: "Orange___Haunglongbing_(Citrus_greening)",
    name: "Huanglongbing (Citrus Greening)",
    plant: "Orange",
    isHealthy: false,
    symptoms: "Blotchy mottling of leaves, lopsided and bitter fruit, and eventual tree decline. One of the most devastating citrus diseases.",
    prevention: "Control Asian citrus psyllid populations. Plant certified disease-free nursery stock.",
    detailedInfo: "Huanglongbing (HLB) is one of the most devastating citrus diseases worldwide, caused by the bacterium Candidatus Liberibacter. It is spread by the Asian citrus psyllid. There is no known cure for infected trees.",
    careInstructions: [
      "Control Asian citrus psyllid populations with systemic insecticides (imidacloprid or dinotefuran).",
      "Remove and destroy infected trees to prevent spread to healthy trees.",
      "Plant certified disease-free nursery stock from reputable sources.",
      "Apply foliar nutritional sprays (micronutrients) to support tree health and manage symptoms."
    ]
  },
  {
    id: "peach-bacterial-spot",
    className: "Peach___Bacterial_spot",
    name: "Bacterial Spot",
    plant: "Peach",
    isHealthy: false,
    symptoms: "Small, dark, water-soaked lesions on leaves, fruit spots, and twig cankers. Spotted leaves may turn yellow and drop.",
    prevention: "Apply copper-based bactericides during dormant season and at petal fall.",
    detailedInfo: "Bacterial spot of peach is caused by Xanthomonas arboricola pv. pruni. It causes small, dark, water-soaked lesions on leaves, fruit spots, and twig cankers. Severely spotted leaves may turn yellow and drop.",
    careInstructions: [
      "Apply copper-based bactericides during dormant season and at petal fall.",
      "Plant resistant peach varieties suited to your growing region.",
      "Avoid overhead irrigation and minimize leaf wetness.",
      "Prune trees to improve air circulation and remove infected shoots."
    ]
  },
  {
    id: "peach-healthy",
    className: "Peach___healthy",
    name: "Healthy",
    plant: "Peach",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal coloration and healthy growth.",
    prevention: "Maintain regular watering and balanced fertilization for good fruit production.",
    detailedInfo: "This class represents healthy peach leaves with no visible signs of disease. The plant shows normal coloration and healthy growth.",
    careInstructions: [
      "Maintain regular watering and balanced fertilization for good fruit production.",
      "Prune annually to maintain open center tree shape for air circulation.",
      "Apply dormant oil spray in late winter to control overwintering pests.",
      "Thin fruit in spring to prevent branch breakage and improve fruit size."
    ]
  },
  {
    id: "pepper-bacterial-spot",
    className: "Pepper,_bell___Bacterial_spot",
    name: "Bacterial Spot",
    plant: "Bell Pepper",
    isHealthy: false,
    symptoms: "Small, dark, water-soaked spots on leaves and raised, scab-like lesions on fruit. Spreads rapidly in warm, rainy conditions.",
    prevention: "Use certified disease-free seed and transplants. Apply copper-based bactericides.",
    detailedInfo: "Bacterial spot of pepper is caused by Xanthomonas species. It produces small, dark, water-soaked spots on leaves and raised, scab-like lesions on fruit. The disease spreads rapidly in warm, rainy conditions.",
    careInstructions: [
      "Use certified disease-free seed and transplants.",
      "Apply copper-based bactericides as a preventive spray during wet weather.",
      "Rotate crops with non-solanaceous plants for at least 2 years.",
      "Avoid working in the garden when plants are wet to prevent bacterial spread."
    ]
  },
  {
    id: "pepper-healthy",
    className: "Pepper,_bell___healthy",
    name: "Healthy",
    plant: "Bell Pepper",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal green coloration and vigorous growth.",
    prevention: "Maintain consistent watering to prevent blossom end rot and stress.",
    detailedInfo: "This class represents healthy bell pepper leaves with no visible signs of disease. The plant shows normal green coloration and vigorous growth.",
    careInstructions: [
      "Maintain consistent watering to prevent blossom end rot and stress.",
      "Provide balanced fertilizer with adequate calcium and magnesium.",
      "Stake or cage plants to support heavy fruit loads.",
      "Monitor for common pepper pests like aphids and pepper weevils."
    ]
  },
  {
    id: "potato-early-blight",
    className: "Potato___Early_blight",
    name: "Early Blight",
    plant: "Potato",
    isHealthy: false,
    symptoms: "Dark, concentric-ringed (target-like) lesions on older leaves first, gradually moving upward. Causes defoliation and reduced tuber yield.",
    prevention: "Practice crop rotation with non-solanaceous crops for at least 3 years.",
    detailedInfo: "Early blight is caused by Alternaria solani. It produces dark, concentric-ringed (target-like) lesions on older leaves first, gradually moving upward. Severe infection causes significant defoliation and reduced tuber yield.",
    careInstructions: [
      "Apply fungicide (chlorothalonil or mancozeb) at first sign of disease or preventively.",
      "Practice crop rotation with non-solanaceous crops for at least 3 years.",
      "Remove and destroy infected plant debris after harvest.",
      "Ensure adequate spacing and avoid excessive nitrogen fertilization."
    ]
  },
  {
    id: "potato-late-blight",
    className: "Potato___Late_blight",
    name: "Late Blight",
    plant: "Potato",
    isHealthy: false,
    symptoms: "Dark, water-soaked lesions on leaves, stems, and tubers, often with white mold on the underside. Can destroy entire crops in days.",
    prevention: "Use certified disease-free seed potatoes and resistant varieties. Improve drainage.",
    detailedInfo: "Late blight is caused by Phytophthora infestans. It produces dark, water-soaked lesions on leaves, stems, and tubers. This was the disease responsible for the Irish Potato Famine in the 1840s.",
    careInstructions: [
      "Apply fungicide (chlorothalonil, mancozeb, or metalaxyl) preventively during cool, wet weather.",
      "Destroy volunteer potato plants and cull piles that harbor the pathogen.",
      "Use certified disease-free seed potatoes and resistant varieties.",
      "Improve drainage and avoid overhead irrigation to reduce leaf wetness."
    ]
  },
  {
    id: "potato-healthy",
    className: "Potato___healthy",
    name: "Healthy",
    plant: "Potato",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal green coloration and vigorous growth.",
    prevention: "Hill soil around plants as they grow to protect developing tubers from light.",
    detailedInfo: "This class represents healthy potato leaves with no visible signs of disease. The plant shows normal green coloration and vigorous growth.",
    careInstructions: [
      "Hill soil around plants as they grow to protect developing tubers from light.",
      "Maintain consistent moisture, especially during tuber formation.",
      "Scout regularly for Colorado potato beetles and other pests.",
      "Practice crop rotation to prevent soil-borne disease buildup."
    ]
  },
  {
    id: "raspberry-healthy",
    className: "Raspberry___healthy",
    name: "Healthy",
    plant: "Raspberry",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal coloration and healthy leaf structure.",
    prevention: "Remove spent floricanes after harvest to improve air circulation.",
    detailedInfo: "This class represents healthy raspberry leaves with no visible signs of disease. The plant shows normal coloration and healthy leaf structure.",
    careInstructions: [
      "Remove spent floricanes after harvest to improve air circulation.",
      "Provide trellising to keep canes upright and improve light exposure.",
      "Apply mulch to conserve moisture and suppress weeds.",
      "Fertilize in early spring with balanced fertilizer for vigorous growth."
    ]
  },
  {
    id: "soybean-healthy",
    className: "Soybean___healthy",
    name: "Healthy",
    plant: "Soybean",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal coloration and growth pattern.",
    prevention: "Monitor for soybean aphids and other pests during reproductive stages.",
    detailedInfo: "This class represents healthy soybean leaves with no visible signs of disease. The plant shows normal coloration and growth pattern.",
    careInstructions: [
      "Monitor for soybean aphids and other pests during reproductive stages.",
      "Ensure proper inoculation with Bradyrhizobium for nitrogen fixation.",
      "Rotate with non-legume crops to break pest and disease cycles.",
      "Scout for common diseases during warm, humid weather periods."
    ]
  },
  {
    id: "squash-powdery-mildew",
    className: "Squash___Powdery_mildew",
    name: "Powdery Mildew",
    plant: "Squash",
    isHealthy: false,
    symptoms: "White, powdery fungal growth covers leaf surfaces, reducing photosynthesis and potentially causing leaf death.",
    prevention: "Ensure adequate plant spacing for good air circulation. Plant resistant varieties.",
    detailedInfo: "Powdery mildew on squash is caused by Podosphaera xanthii or Erysiphe cichoracearum. White, powdery fungal growth covers leaf surfaces, reducing photosynthesis and potentially causing leaf death.",
    careInstructions: [
      "Apply potassium bicarbonate, sulfur, or neem oil at first sign of infection.",
      "Plant resistant squash varieties when available.",
      "Ensure adequate plant spacing for good air circulation.",
      "Avoid late-season overhead irrigation; water at the base of plants."
    ]
  },
  {
    id: "strawberry-leaf-scorch",
    className: "Strawberry___Leaf_scorch",
    name: "Leaf Scorch",
    plant: "Strawberry",
    isHealthy: false,
    symptoms: "Small, dark purple spots on the upper leaf surface that enlarge and merge, giving a scorched appearance. Weakens the plant.",
    prevention: "Remove and destroy infected leaves and plant debris. Plant resistant varieties.",
    detailedInfo: "Leaf scorch is caused by the fungus Diplocarpon earlianum. It produces small, dark purple spots on the upper leaf surface that enlarge and merge, giving a scorched appearance. Severe infections weaken the plant.",
    careInstructions: [
      "Apply fungicide (captan or copper-based) starting at bloom and continuing through harvest.",
      "Remove and destroy infected leaves and plant debris.",
      "Renovate strawberry beds after harvest by mowing and thinning.",
      "Plant resistant varieties and ensure good air circulation between rows."
    ]
  },
  {
    id: "strawberry-healthy",
    className: "Strawberry___healthy",
    name: "Healthy",
    plant: "Strawberry",
    isHealthy: true,
    symptoms: "No visible signs of disease. Normal green coloration and vigorous growth.",
    prevention: "Maintain straw mulch around plants to keep fruit clean and conserve moisture.",
    detailedInfo: "This class represents healthy strawberry leaves with no visible signs of disease. The plant shows normal green coloration and vigorous growth.",
    careInstructions: [
      "Maintain straw mulch around plants to keep fruit clean and conserve moisture.",
      "Remove runners regularly to maintain plant vigor and fruit size.",
      "Provide consistent watering, especially during fruit development.",
      "Renovate beds annually to control disease and maintain productivity."
    ]
  },
  {
    id: "tomato-bacterial-spot",
    className: "Tomato___Bacterial_spot",
    name: "Bacterial Spot",
    plant: "Tomato",
    isHealthy: false,
    symptoms: "Small, dark, water-soaked lesions on leaves and fruit. Leaves yellow and drop, exposing fruit to sunscald.",
    prevention: "Use disease-free seed and transplants. Apply copper-based sprays preventively.",
    detailedInfo: "Bacterial spot is caused by Xanthomonas species. Small, dark, water-soaked lesions appear on leaves and fruit. In severe cases, leaves yellow and drop, exposing fruit to sunscald.",
    careInstructions: [
      "Use disease-free seed and transplants from trusted sources.",
      "Apply copper-based sprays preventively during warm, wet weather.",
      "Avoid overhead watering and minimize leaf wetness duration.",
      "Rotate crops with non-solanaceous plants for 2-3 years."
    ]
  },
  {
    id: "tomato-early-blight",
    className: "Tomato___Early_blight",
    name: "Early Blight",
    plant: "Tomato",
    isHealthy: false,
    symptoms: "Dark, concentric-ringed (target-shaped) spots on lower leaves first. Causes significant defoliation and reduced fruit quality.",
    prevention: "Mulch around plants to prevent soil splash. Stake or cage tomatoes for air circulation.",
    detailedInfo: "Early blight is caused by Alternaria solani. It produces dark, concentric-ringed (target-shaped) spots on lower leaves first. Severe infections cause significant defoliation and reduced fruit quality.",
    careInstructions: [
      "Apply fungicide (chlorothalonil or copper) when first symptoms appear on lower leaves.",
      "Mulch around plants to prevent soil splash onto lower leaves.",
      "Stake or cage tomatoes to improve air circulation and keep foliage off the ground.",
      "Remove and destroy infected lower leaves as the disease progresses."
    ]
  },
  {
    id: "tomato-late-blight",
    className: "Tomato___Late_blight",
    name: "Late Blight",
    plant: "Tomato",
    isHealthy: false,
    symptoms: "Large, dark, water-soaked lesions on leaves and stems with white fuzzy growth on underside. Can destroy a crop within days.",
    prevention: "Plant resistant varieties. Apply fungicide immediately at first sign.",
    detailedInfo: "Late blight is caused by Phytophthora infestans. It produces large, dark, water-soaked lesions on leaves and stems with white fuzzy growth on the underside. It can destroy an entire crop within days.",
    careInstructions: [
      "Apply fungicide (chlorothalonil or copper) immediately at first sign; repeat every 5-7 days.",
      "Remove and destroy all infected plants promptly to prevent spread.",
      "Avoid overhead irrigation and water early in the day.",
      "Plant resistant varieties and use certified disease-free transplants."
    ]
  },
  {
    id: "tomato-leaf-mold",
    className: "Tomato___Leaf_Mold",
    name: "Leaf Mold",
    plant: "Tomato",
    isHealthy: false,
    symptoms: "Pale greenish-yellow spots on upper leaf surfaces with olive-green to grayish-brown velvety mold underneath. Common in greenhouses.",
    prevention: "Improve ventilation in greenhouses. Reduce humidity by watering at the base.",
    detailedInfo: "Tomato leaf mold is caused by Passalora fulva (formerly Cladosporium fulvum). Pale greenish-yellow spots appear on upper leaf surfaces with velvety mold underneath. It is especially common in greenhouse production.",
    careInstructions: [
      "Improve ventilation in greenhouses by increasing spacing and airflow.",
      "Reduce humidity by watering at the base and avoiding evening irrigation.",
      "Apply fungicide (chlorothalonil or copper) if infection is progressing.",
      "Plant leaf mold-resistant tomato varieties for greenhouse production."
    ]
  },
  {
    id: "tomato-septoria",
    className: "Tomato___Septoria_leaf_spot",
    name: "Septoria Leaf Spot",
    plant: "Tomato",
    isHealthy: false,
    symptoms: "Many small, circular spots with dark borders and gray centers containing tiny black dots. Lower leaves affected first.",
    prevention: "Mulch around plants to reduce soil splash. Rotate planting areas annually.",
    detailedInfo: "Septoria leaf spot is caused by Septoria lycopersici. It produces many small, circular spots with dark borders and gray centers containing tiny black dots (pycnidia). Lower leaves are affected first.",
    careInstructions: [
      "Apply fungicide (chlorothalonil or mancozeb) at first sign of disease.",
      "Remove infected lower leaves to slow the spread upward through the canopy.",
      "Mulch around plants to reduce soil splash and spore dispersal.",
      "Rotate tomato planting areas and clean up all crop debris after harvest."
    ]
  },
  {
    id: "tomato-spider-mites",
    className: "Tomato___Spider_mites Two-spotted_spider_mite",
    name: "Spider Mites (Two-Spotted)",
    plant: "Tomato",
    isHealthy: false,
    symptoms: "Stippling and yellowing of leaves. Heavy infestations produce visible webbing and can cause leaf drop. Thrives in hot, dry conditions.",
    prevention: "Spray plants with a strong stream of water to dislodge mites. Introduce predatory mites.",
    detailedInfo: "Two-spotted spider mites (Tetranychus urticae) cause stippling and yellowing of leaves. Heavy infestations produce visible webbing and can cause leaf drop. They thrive in hot, dry conditions.",
    careInstructions: [
      "Spray plants with a strong stream of water to dislodge mites from leaf undersides.",
      "Apply insecticidal soap or neem oil, ensuring thorough coverage of leaf undersides.",
      "Introduce predatory mites (Phytoseiulus persimilis) for biological control.",
      "Avoid broad-spectrum insecticides that kill natural predators of spider mites."
    ]
  },
  {
    id: "tomato-target-spot",
    className: "Tomato___Target_Spot",
    name: "Target Spot",
    plant: "Tomato",
    isHealthy: false,
    symptoms: "Circular, brown lesions with concentric rings on leaves, stems, and fruit. Favored by warm, humid conditions.",
    prevention: "Improve air circulation by proper staking, pruning, and plant spacing.",
    detailedInfo: "Target spot is caused by Corynespora cassiicola. It produces circular, brown lesions with concentric rings on leaves, stems, and fruit. The disease is favored by warm, humid conditions.",
    careInstructions: [
      "Apply fungicide (chlorothalonil or mancozeb) when conditions favor disease development.",
      "Improve air circulation by proper staking, pruning, and plant spacing.",
      "Remove and destroy infected plant debris from the garden.",
      "Avoid overhead irrigation and water at the base of plants."
    ]
  },
  {
    id: "tomato-ylcv",
    className: "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    name: "Yellow Leaf Curl Virus (TYLCV)",
    plant: "Tomato",
    isHealthy: false,
    symptoms: "Severe leaf curling, yellowing, and stunting. Plants infected early produce little or no fruit. Transmitted by whiteflies.",
    prevention: "Control whitefly populations. Use resistant tomato varieties. Install fine-mesh insect netting.",
    detailedInfo: "TYLCV is transmitted by whiteflies (Bemisia tabaci). Infected plants show severe leaf curling, yellowing, and stunting. Plants infected early produce little or no fruit. There is no cure for infected plants.",
    careInstructions: [
      "Control whitefly populations with insecticides (imidacloprid) or reflective mulches.",
      "Use resistant tomato varieties where TYLCV is prevalent.",
      "Install fine-mesh insect netting over transplants and in greenhouses.",
      "Remove and destroy infected plants immediately to reduce virus reservoirs."
    ]
  },
  {
    id: "tomato-mosaic-virus",
    className: "Tomato___Tomato_mosaic_virus",
    name: "Mosaic Virus (ToMV)",
    plant: "Tomato",
    isHealthy: false,
    symptoms: "Mottled light and dark green patterns on leaves, leaf distortion, and reduced fruit quality. Spreads through contaminated hands and tools.",
    prevention: "Wash hands thoroughly before handling plants. Disinfect tools between plants.",
    detailedInfo: "Tomato mosaic virus causes mottled light and dark green patterns on leaves, leaf distortion, and reduced fruit quality. It spreads through contaminated hands, tools, and seed. It is highly persistent in the environment.",
    careInstructions: [
      "Wash hands thoroughly with soap before handling plants, especially after smoking.",
      "Disinfect tools, stakes, and equipment with 10% bleach solution between plants.",
      "Remove and destroy infected plants; do not compost them.",
      "Plant ToMV-resistant varieties (look for 'TMV' or 'ToMV' resistance codes on seed packs)."
    ]
  },
  {
    id: "tomato-healthy",
    className: "Tomato___healthy",
    name: "Healthy",
    plant: "Tomato",
    isHealthy: true,
    symptoms: "No visible signs of disease or pest damage. Normal green coloration and vigorous growth.",
    prevention: "Continue regular watering at the base. Maintain balanced fertilization with calcium.",
    detailedInfo: "This class represents healthy tomato leaves with no visible signs of disease or pest damage. The plant shows normal green coloration and vigorous growth.",
    careInstructions: [
      "Continue regular watering at the base; avoid wetting the foliage.",
      "Maintain balanced fertilization with calcium to prevent blossom end rot.",
      "Stake or cage plants for good support and air circulation.",
      "Scout regularly for early signs of common tomato diseases and pests."
    ]
  },
];

const PLANT_TYPES = [...new Set(DISEASES.map(d => d.plant))].sort();

export function DiseaseLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredDiseases = DISEASES.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.plant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !activeFilter || d.plant === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const diseaseCount = filteredDiseases.filter(d => !d.isHealthy).length;
  const healthyCount = filteredDiseases.filter(d => d.isHealthy).length;

  return (
    <div className="min-h-screen pb-12 px-6 leaf-gradient">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 pt-8">
          <h1 className="font-serif text-5xl font-bold text-emerald-950 mb-4">Disease Library</h1>
          <p className="text-gray-600 max-w-2xl">
            Complete reference for all 38 plant conditions our AI model can detect.
            Covering {PLANT_TYPES.length} plant types with diseases and healthy baselines.
          </p>
          <div className="flex gap-4 mt-6">
            <div className="glass px-4 py-2 rounded-xl text-sm font-bold text-emerald-700">
              {filteredDiseases.length} Total Classes
            </div>
            <div className="glass px-4 py-2 rounded-xl text-sm font-bold text-amber-700">
              {diseaseCount} Diseases
            </div>
            <div className="glass px-4 py-2 rounded-xl text-sm font-bold text-green-700">
              {healthyCount} Healthy
            </div>
          </div>
        </header>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search diseases or plants (e.g., Tomato, Blight, Rust)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 border rounded-2xl font-bold transition-all shadow-sm",
              showFilters || activeFilter
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
          >
            <Leaf size={20} />
            {activeFilter || "All Plants"}
          </button>
        </div>

        {/* Filter pills */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 p-4 glass rounded-2xl">
                <button
                  onClick={() => { setActiveFilter(null); setShowFilters(false); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    !activeFilter ? "bg-emerald-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                  )}
                >
                  All ({DISEASES.length})
                </button>
                {PLANT_TYPES.map(plant => {
                  const count = DISEASES.filter(d => d.plant === plant).length;
                  const colors = getPlantColor(plant);
                  return (
                    <button
                      key={plant}
                      onClick={() => { setActiveFilter(plant); setShowFilters(false); }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        activeFilter === plant
                          ? "bg-emerald-600 text-white"
                          : `${colors.bg} ${colors.text} hover:opacity-80`
                      )}
                    >
                      {plant} ({count})
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disease grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDiseases.map((disease, i) => {
            const colors = getPlantColor(disease.plant);
            return (
              <motion.div
                key={disease.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                viewport={{ once: true }}
                onClick={() => setSelectedDisease(disease)}
                className="glass rounded-[2rem] p-6 group hover:shadow-2xl transition-all cursor-pointer flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center ring-2", colors.bg, colors.ring)}>
                    {disease.isHealthy
                      ? <Heart size={22} className="text-green-600" />
                      : <AlertTriangle size={22} className={colors.text} />
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full", colors.bg, colors.text)}>
                      {disease.plant}
                    </span>
                    {disease.isHealthy && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-green-50 text-green-700">
                        Healthy
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-emerald-950 mb-2">{disease.name}</h3>

                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                  {disease.symptoms}
                </p>

                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mt-auto pt-4 border-t border-gray-100">
                  View Details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredDiseases.length === 0 && (
          <div className="text-center py-20 glass rounded-[3rem]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No results found</h3>
            <p className="text-gray-500">Try searching for a different plant or disease name.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDisease && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDisease(null)}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <button
                onClick={() => setSelectedDisease(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center text-gray-900 shadow-lg hover:bg-white transition-all active:scale-95"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto p-8 lg:p-12">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const colors = getPlantColor(selectedDisease.plant);
                      return (
                        <>
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center ring-2", colors.bg, colors.ring)}>
                            {selectedDisease.isHealthy
                              ? <Heart size={26} className="text-green-600" />
                              : <AlertTriangle size={26} className={colors.text} />
                            }
                          </div>
                          <div>
                            <span className={cn("text-xs font-bold uppercase tracking-widest", colors.text)}>
                              {selectedDisease.plant}
                              {selectedDisease.isHealthy && ' — Healthy Baseline'}
                            </span>
                            <h2 className="text-4xl font-serif font-bold text-emerald-950">{selectedDisease.name}</h2>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    Model Class: {selectedDisease.className}
                  </p>
                </div>

                <div className="space-y-8">
                  <section>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info size={16} className="text-emerald-600" />
                      Overview
                    </h4>
                    <p className="text-gray-600 leading-relaxed">{selectedDisease.detailedInfo}</p>
                  </section>

                  <div className="grid md:grid-cols-2 gap-6">
                    <section className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                      <h4 className="text-sm font-bold text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-600" />
                        {selectedDisease.isHealthy ? 'Characteristics' : 'Symptoms'}
                      </h4>
                      <p className="text-sm text-amber-800/80 leading-relaxed">{selectedDisease.symptoms}</p>
                    </section>

                    <section className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                      <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        Prevention
                      </h4>
                      <p className="text-sm text-emerald-800/80 leading-relaxed">{selectedDisease.prevention}</p>
                    </section>
                  </div>

                  <section>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                      {selectedDisease.isHealthy ? 'Maintenance Tips' : 'Care Instructions'}
                    </h4>
                    <div className="space-y-3">
                      {selectedDisease.careInstructions.map((step, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-emerald-50 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="pt-8 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => setSelectedDisease(null)}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
