#!/usr/bin/env python3

import json

import cv2
import numpy as np
from PIL import Image


def image_to_vector_paths(image_path,
                          output_scale_factor=4.0,
                          blur_ksize=(5, 5),
                          canny_threshold1=50,
                          canny_threshold2=150,
                          approximation_epsilon_factor=0.002,  # Factor of contour perimeter
                          min_contour_area=10):
    """
    Converts a raster image to a series of vector paths.

    Args:
        image_path (str): Path to the input image.
        output_scale_factor (float): Desired extent of the longest dimension in the output 3D space.
                                     Coordinates will be roughly in [-scale/2, scale/2].
        blur_ksize (tuple): Kernel size for Gaussian blur.
        canny_threshold1 (int): First threshold for the Canny edge detector.
        canny_threshold2 (int): Second threshold for the Canny edge detector.
        approximation_epsilon_factor (float): Factor of contour perimeter for Douglas-Peucker approximation.
                                             Smaller values mean more detail, larger means more simplification.
        min_contour_area (int): Minimum area for a contour to be considered.

    Returns:
        str: A string representing a JavaScript array of paths.
    """
    try:
        # 1. Load Image using Pillow (to handle various formats and get original mode)
        pil_img = Image.open(image_path)
        # Convert to OpenCV format
        img = np.array(pil_img)
        if pil_img.mode == 'RGBA':
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)  # OpenCV uses BGR by default
        elif pil_img.mode == 'RGB':
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        elif pil_img.mode == 'P':  # Palette mode, often for GIFs or some PNGs
            pil_img = pil_img.convert("RGB")
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        original_height, original_width = img.shape[:2]
    except Exception as e:
        print(f"Error loading image: {e}")
        return "[]"

    # 2. Preprocessing
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, blur_ksize, 0)
    edges = cv2.Canny(blurred, canny_threshold1, canny_threshold2)

    # (Optional) Dilate and Erode to close gaps in edges - might be useful for some images
    # kernel = np.ones((2,2), np.uint8)
    # edges = cv2.dilate(edges, kernel, iterations=1)
    # edges = cv2.erode(edges, kernel, iterations=1)

    # 3. Find Contours
    # Use RETR_LIST to get all contours without hierarchy, which is simpler for drawing all lines
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    all_paths = []

    # 4. Process Contours
    for contour in contours:
        if cv2.contourArea(contour) < min_contour_area:
            continue  # Skip small contours (noise)

        # Simplify contour
        perimeter = cv2.arcLength(contour, True)
        epsilon = approximation_epsilon_factor * perimeter
        approximated_contour = cv2.approxPolyDP(contour, epsilon, True)

        path = []
        for point in approximated_contour:
            x, y = point[0]  # Point is [[x, y]]

            # Normalize and center coordinates
            # (0,0) in OpenCV is top-left. In Three.js, we often want (0,0) at the center.
            # Y is inverted because OpenCV Y goes down, Three.js Y typically goes up.
            norm_x = (x / original_width - 0.5)
            norm_y = (0.5 - y / original_height)  # Invert Y

            path.append({"x": round(norm_x, 4), "y": round(norm_y, 4)})

        if len(path) > 1:  # Only add paths with at least 2 points
            all_paths.append(path)

    # 5. Scale all paths together to fit output_scale_factor
    # Find current extent of normalized coordinates
    if not all_paths:
        return "[]"

    all_points_flat = [pt for pth in all_paths for pt in pth]
    if not all_points_flat:
        return "[]"

    min_x_norm = min(pt['x'] for pt in all_points_flat)
    max_x_norm = max(pt['x'] for pt in all_points_flat)
    min_y_norm = min(pt['y'] for pt in all_points_flat)
    max_y_norm = max(pt['y'] for pt in all_points_flat)

    current_width_norm = max_x_norm - min_x_norm
    current_height_norm = max_y_norm - min_y_norm

    if current_width_norm == 0 or current_height_norm == 0:  # Avoid division by zero if it's a point or line
        scale = 1.0
    else:
        if current_width_norm > current_height_norm:
            scale = output_scale_factor / current_width_norm
        else:
            scale = output_scale_factor / current_height_norm

    scaled_paths = []
    for path in all_paths:
        scaled_path = []
        for point in path:
            # Apply scale and ensure centering based on the overall bounding box of normalized points
            # The previous normalization already centered based on image dimensions.
            # Now we scale to the target output_scale_factor.
            scaled_x = point['x'] * scale
            scaled_y = point['y'] * scale
            scaled_path.append({"x": round(scaled_x, 4), "y": round(scaled_y, 4)})
        scaled_paths.append(scaled_path)

    # 6. Format for JavaScript
    # Output as a string that can be pasted directly as a JS variable
    js_array_string = json.dumps(scaled_paths, indent=None)  # indent=None for compact output

    return js_array_string


if __name__ == '__main__':
    image_file = 'marko_polo_portrait.jpg'
    print(f"Processing '{image_file}'...")

    vector_data_string = image_to_vector_paths(
        image_file,
        output_scale_factor=4.0,
        blur_ksize=(7, 7),  # Increased blur
        canny_threshold1=100,  # Increased Canny lower threshold
        canny_threshold2=250,  # Increased Canny upper threshold
        approximation_epsilon_factor=0.005,  # Increased simplification
        min_contour_area=50  # Significantly increased min area
    )

    if vector_data_string and vector_data_string != "[]":
        print("\nCOPY THE FOLLOWING JAVASCRIPT ARRAY INTO YOUR HTML FILE:\n")
        print(f"const vectorizedImagePaths = {vector_data_string};")
        print(f"\nSuccessfully processed. Found {vector_data_string.count('[') // 2 - 1} paths.")
    else:
        print(f"Could not generate vector paths for {image_file}. Try adjusting parameters or check image path.")
