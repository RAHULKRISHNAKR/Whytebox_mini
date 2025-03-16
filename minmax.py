import json
import math

def find_min_max(obj, current_min=math.inf, current_max=-math.inf, decimal_parts=None):
    """
    Recursively traverse the JSON object to update current min and max.
    Collect unique decimal parts.
    """
    if decimal_parts is None:
        decimal_parts = set()

    if isinstance(obj, (int, float)):
        current_min = min(current_min, obj)
        current_max = max(current_max, obj)
        
        # Extract decimal part
        decimal_part = round(abs(obj) % 1, 10)  # Avoid floating-point precision issues
        if decimal_part > 0:
            decimal_parts.add(decimal_part)

    elif isinstance(obj, list):
        for item in obj:
            current_min, current_max, decimal_parts = find_min_max(item, current_min, current_max, decimal_parts)
    elif isinstance(obj, dict):
        for key in obj:
            current_min, current_max, decimal_parts = find_min_max(obj[key], current_min, current_max, decimal_parts)

    return current_min, current_max, decimal_parts

# Replace 'coffeepot.json' with the path to your JSON file
with open("coffeepot.json", "r") as file:
    data = json.load(file)

min_value, max_value, decimal_parts = find_min_max(data)

print("Minimum value:", min_value)
print("Maximum value:", max_value)
print("Unique decimal parts:", sorted(decimal_parts))
