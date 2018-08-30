extends Node2D
#This node is necessary in order to display a 3d node in a 2d game

#just passes off data and instructions to make scene into scene3d or scene2d node

func make_scene():
	$Node2D/Viewport/Spatial.regenerate()

func _ready():
	$Node2D/Viewport.size = global.size
	make_scene()
	$Sprite.position = global.size * 0.5
	$Sprite.texture = $Node2D/Viewport.get_texture()


func _on_Scene_pressed():
	visible = visible == false
	if visible:
		$Node2D/Viewport.render_target_update_mode = Viewport.UPDATE_ALWAYS
		make_scene()
		set_process(true)
	else:
		$Node2D/Viewport.render_target_update_mode = Viewport.UPDATE_DISABLED
		set_process(false)
		
func _process(delta):
	var cam = $Node2D/Viewport/Spatial/Camera.translation
	var distance = Vector2(cam.x, cam.z).length_squared()/10000
	$Sprite.material.set_shader_param("radius", distance)

