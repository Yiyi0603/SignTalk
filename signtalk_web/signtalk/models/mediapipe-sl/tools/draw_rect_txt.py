import cv2

def draw_rect_txt(image, text, brect):
    """
    在边界框上绘制文本
    """
    if brect is None:
        return image
    
    x_min, y_min, x_max, y_max = brect
    
    # 计算文本位置
    text_x = x_min
    text_y = y_min - 10 if y_min > 20 else y_max + 20
    
    # 绘制文本背景
    (text_width, text_height), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
    cv2.rectangle(image, (text_x, text_y - text_height - 5), 
                  (text_x + text_width, text_y + 5), (0, 0, 0), -1)
    
    # 绘制文本
    cv2.putText(image, text, (text_x, text_y), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    return image