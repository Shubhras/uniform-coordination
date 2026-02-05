import cv2
import numpy as np


def compare_images(original_path: str, return_path: str) -> float:
    """
    Compare two images using structural similarity.
    Returns similarity score between 0 and 1.
    """
    img1 = cv2.imread(original_path)
    img2 = cv2.imread(return_path)

    img1 = cv2.resize(img1, (300, 300))
    img2 = cv2.resize(img2, (300, 300))

    difference = cv2.absdiff(img1, img2)
    score = np.mean(difference)

    return score


def ai_check_product_condition(original_image: str, return_image: str) -> str:
    """
    AI logic:
    - If images very similar → GOOD
    - If big difference → DAMAGE
    """

    score = compare_images(original_image, return_image)

    # You can tune this threshold
    if score < 15:
        return "good"
    else:
        return "damage"
