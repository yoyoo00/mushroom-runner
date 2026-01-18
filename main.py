import pygame
import random

# ==============================================================================
# 1. 初始化和设置
# ==============================================================================
pygame.init()

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("蘑菇快跑！(代码绘画版)")

# 定义颜色
SKY_BLUE = (135, 206, 235)
WHITE = (255, 255, 255)
GROUND_COLOR = (139, 69, 19) # 棕色
PLAYER_COLOR = (80, 80, 80)   # 深灰色

# 定义游戏常量
GRAVITY = 1
PLAYER_JUMP_STRENGTH = -20
game_speed = 5

# ==============================================================================
# 2. “代码绘画”函数
# ==============================================================================

def create_player_surface():
    """用代码画一个像素小人"""
    # 创建一个 40x40 的透明画板
    player_surface = pygame.Surface((40, 40), pygame.SRCALPHA)
    
    # 用一个简单的图形代表小人 (像不像一个小恐龙？)
    # 每个 'x' 代表一个 5x5 的像素块
    player_art = [
        "  xxxx",
        " xxxxx",
        "x  xx ",
        "  xxx ",
        "  x x "
    ]
    pixel_size = 5
    for y, row in enumerate(player_art):
        for x, char in enumerate(row):
            if char == 'x':
                pygame.draw.rect(player_surface, PLAYER_COLOR, (x * pixel_size, y * pixel_size, pixel_size, pixel_size))
    return player_surface

def create_ground_surface():
    """用代码画一片可以无缝衔接的地面"""
    # 创建一个和屏幕一样宽的地面画板
    ground_surface = pygame.Surface((SCREEN_WIDTH, 100))
    ground_surface.fill(GROUND_COLOR) # 先填充基础颜色
    
    # 添加一些随机的“纹理”点，让它不那么单调
    for _ in range(50):
        x = random.randint(0, SCREEN_WIDTH)
        y = random.randint(20, 90) # 只在下半部分添加
        darker_color = (GROUND_COLOR[0] - 20, GROUND_COLOR[1] - 10, GROUND_COLOR[2])
        pygame.draw.rect(ground_surface, darker_color, (x, y, 10, 10))
    return ground_surface

def create_background_surface():
    """用代码画一个带云彩的背景"""
    background_surface = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
    background_surface.fill(SKY_BLUE) # 填充天空蓝
    
    # 画几朵云
    # 云由几个重叠的白色圆形组成
    pygame.draw.circle(background_surface, WHITE, (150, 100), 30)
    pygame.draw.circle(background_surface, WHITE, (180, 110), 40)
    pygame.draw.circle(background_surface, WHITE, (120, 115), 25)
    
    pygame.draw.circle(background_surface, WHITE, (550, 150), 40)
    pygame.draw.circle(background_surface, WHITE, (600, 140), 50)
    
    return background_surface

# ==============================================================================
# 3. 加载我们的“画作”
# ==============================================================================
player_img = create_player_surface()
ground_image = create_ground_surface()
background_image = create_background_surface()

ground_width = ground_image.get_width()
ground_y = SCREEN_HEIGHT - ground_image.get_height()
ground_x1 = 0
ground_x2 = ground_width

# ==============================================================================
# 4. 玩家类定义 (和之前一样，只是图片来源变了)
# ==============================================================================
class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = player_img # 使用我们画的小人
        self.rect = self.image.get_rect()
        self.rect.x = 100
        self.rect.bottom = ground_y # 确保初始时站在地上
        self.velocity_y = 0
        self.on_ground = True

    def update(self):
        # 应用重力
        self.velocity_y += GRAVITY
        self.rect.y += self.velocity_y
        
        # 触地检测
        if self.rect.bottom >= ground_y:
            self.rect.bottom = ground_y
            self.velocity_y = 0
            self.on_ground = True

    def jump(self):
        if self.on_ground:
            self.velocity_y = PLAYER_JUMP_STRENGTH
            self.on_ground = False

# ==============================================================================
# 5. 创建游戏对象和主循环
# ==============================================================================
player = Player()
clock = pygame.time.Clock()
running = True

while running:
    # --- 事件处理 ---
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE or event.key == pygame.K_UP:
                player.jump()

    # --- 游戏逻辑更新 ---
    ground_x1 -= game_speed
    ground_x2 -= game_speed
    if ground_x1 <= -ground_width:
        ground_x1 = ground_width
    if ground_x2 <= -ground_width:
        ground_x2 = ground_width
    
    player.update()

    # --- 绘制所有内容 ---
    # 1. 先画背景
    screen.blit(background_image, (0, 0))
    # 2. 再画地面
    screen.blit(ground_image, (ground_x1, ground_y))
    screen.blit(ground_image, (ground_x2, ground_y))
    # 3. 最后画玩家
    screen.blit(player.image, player.rect)

    # --- 更新屏幕 ---
    pygame.display.flip()

    # --- 控制帧率 ---
    clock.tick(60)

# ==============================================================================
# 6. 退出游戏
# ==============================================================================
pygame.quit()