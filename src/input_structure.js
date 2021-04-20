import Input from './input'
import Gradient from './gradient'
import {Emitter, updateMaterial, System} from './emitter'
import vscode from './vscode_extension';

const Data = {
	effect: {
		label: '粒子特效',
		meta: {
			label: '元数据',
			_folded: false,
			inputs: {
				identifier: new Input({
					id: 'identifier',
					label: 'ID',
					info: '粒子特效的命名空间与名称',
					placeholder: '命名空间:名称',
					required: true,
					type: 'text',
					onchange() {
						document.title = (this.value ? this.value + ' - ' : '') + 'GermEditor';
					}
				})
			}
		},
		space: {
			label: '局部空间',
			_folded: true,
			inputs: {
				local_position: new Input({
					id: 'space_local_position',
					label: '局部位置',
					info: '启用后，粒子特效将保持附加在粒子发射器所在的局部空间内并直接跟随它们的位置',
					type: 'checkbox'
				}),
				local_rotation: new Input({
					id: 'space_local_rotation',
					label: '局部旋转',
					info: '启用后，粒子特效将保持附加在粒子发射器所在的局部空间内并直接跟随它们的旋转（仅在启用局部位置选项后生效）',
					type: 'checkbox'
				}),
				local_velocity: new Input({
					id: 'space_local_velocity',
					label: '局部速度',
					info: '启用后，粒子特效将保持附加在粒子发射器所在的局部空间内并直接跟随它们的速度',
					type: 'checkbox'
				})
			}
		},
		variables: {
			label: 'MoLang变量',
			_folded: true,
			inputs: {
				creation_vars: new Input({
					id: 'variables_creation_vars',
					label: '启动变量',
					info: '设置粒子发射器启动时的MoLang变量',
					placeholder: 'variable.名称 = 值',
					type: 'molang',
					axis_count: -1,
					onchange: function() {
						Emitter.creation_variables = {};
						this.value.forEach((s, i) => {
							var p = s.toLowerCase().replace(/\s/g, '').split('=')
							if (p.length > 1) {
								let key = p.shift();
								Emitter.creation_variables[key] = p.join('=');
							}
						})
					}
				}),
				tick_vars: new Input({
					id: 'variables_tick_vars',
					label: '游戏刻变量',
					info: '每次粒子发射器更新时处理MoLang变量',
					placeholder: 'variable.名称 = 值',
					type: 'molang',
					axis_count: -1,
					onchange: function() {
						Emitter.tick_variables = {};
						this.value.forEach((s, i) => {
							var p = s.toLowerCase().replace(/\s/g, '').split('=')
							if (p.length > 1) {
								let key = p.shift();
								Emitter.tick_variables[key] = p.join('=');
							}
						})
					}
				})
			}
		},
		curves: {
			label: '粒子曲线',
			_folded: true,
			type: 'curves',
			curves: []
		}
	},
	emitter: {
		label: '粒子发射器',
		rate: {
			label: '频率',
			_folded: false,
			inputs: {
				mode: new Input({
					id: 'emitter_rate_mode',
					type: 'select',
					label: '模式',
					info: '',
					mode_groups: ['emitter', 'rate'],
					options: {
						steady: '固定模式',
						instant: '瞬时模式'
					}
				}),
				rate: new Input({
					id: 'emitter_rate_rate',
					label: '发射频率',
					info: '设置发射器每秒发射的粒子数',
					enabled_modes: ['steady'],
					required: true,
					value: 1,
				}),
				amount: new Input({
					id: 'emitter_rate_amount',
					label: '发射数量',
					info: '设置发射器一次性发射的粒子数',
					enabled_modes: ['instant'],
					required: true,
				}),
				maximum: new Input({
					id: 'emitter_rate_maximum',
					label: '最大发射值',
					info: '设置发射器每次发射的最大粒子数',
					enabled_modes: ['steady'],
					required: true,
					value: 100,
				})
			}
		},
		lifetime: {
			label: '生命周期',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'emitter_lifetime_mode',
					type: 'select',
					label: '模式',
					info: '',
					mode_groups: ['emitter', 'lifetime'],
					options: {
						looping: '周期循环',
						once: '单次周期',
						expression: '表达式'
					},
					//updatePreview: (m) => {Emitter.mode = m}
				}),
				active_time: new Input({
					id: 'emitter_lifetime_active_time',
					label: '发射时间',
					info: '设置发射器每个周期的发射时间',
					enabled_modes: ['looping', 'once'],
					required: true,
					value: 1,
					//updatePreview: (v) => {Emitter.active_time = v}
				}),
				sleep_time: new Input({
					id: 'emitter_lifetime_sleep_time',
					label: '休眠时间',
					info: '设置发射器每个周期结束后的暂停时间',
					enabled_modes: ['looping'],
					//updatePreview: (v) => {Emitter.sleep_time = v}
				}),
				activation: new Input({
					id: 'emitter_lifetime_activation',
					label: '发射表达式',
					info: '当表达式结果不为零时进行粒子发射',
					required: true,
					enabled_modes: ['expression']
				}),
				expiration: new Input({
					id: 'emitter_lifetime_expiration',
					label: '结束表达式',
					info: '当表达式结果不为零时结束粒子发射',
					enabled_modes: ['expression']
				})
			}
		},
		shape: {
			label: '形状',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'emitter_shape_mode',
					type: 'select',
					label: '模式',
					mode_groups: ['emitter', 'shape'],
					options: {
						point: '点状',
						sphere: '球体',
						box: '正方体',
						disc: '圆盘',
						//custom: 'Custom',
						entity_aabb: '实体碰撞箱',
					},
					//updatePreview: (m) => {Emitter.shape = m}
				}),
				offset: new Input({
					id: 'emitter_shape_offset',
					label: '偏移',
					info: '设置每个发射的粒子与发射器的距离',
					axis_count: 3,
					enabled_modes: ['point', 'sphere', 'box', 'custom', 'disc']
				}),
				radius: new Input({
					id: 'emitter_shape_radius',
					label: '半径',
					required: true,
					info: '设置半径',
					enabled_modes: ['sphere', 'disc'],
				}),
				half_dimensions: new Input({
					id: 'emitter_shape_half_dimensions',
					label: '正方体大小',
					info: '设置正方体的边长的一半的值',
					axis_count: 3,
					enabled_modes: ['box'],
				}),
				plane_normal: new Input({
					id: 'emitter_shape_plane_normal',
					label: '法线',
					info: '设置圆盘平面的法线，圆盘将垂直于该方向',
					axis_count: 3,
					enabled_modes: ['disc']
				}),
				surface_only: new Input({
					id: 'emitter_shape_surface_only',
					label: '仅表面',
					info: '仅在表面发射粒子',
					type: 'checkbox',
					enabled_modes: ['sphere', 'box', 'entity_aabb', 'disc']
				})
			}
		},
	},
	particle: {
		label: '粒子',
		appearance: {
			label: '外观',
			_folded: false,
			inputs: {
				size: new Input({
					id: 'particle_appearance_size',
					label: '大小',
					info: '设置粒子板的x/y值',
					axis_count: 2,
					value: [0.2, 0.2]
				}),
				facing_camera_mode: new Input({
					id: 'particle_appearance_facing_camera_mode',
					type: 'select',
					info: '选择粒子板面向玩家相机的模式',
					label: '朝向',
					options: {
						rotate_xyz: '与相机对齐，垂直于视图轴',
						rotate_y: '与相机对齐，绕世界Y轴旋转',
						lookat_xyz: '瞄准相机，偏向世界Y轴',
						lookat_y: '瞄准相机，绕世界Y轴旋转',
						direction_x: '未旋转的粒子X轴沿方向矢量，未旋转的Y轴尝试向上瞄准',
						direction_y: '未旋转的粒子Y轴沿方向矢量，未旋转的X轴尝试向上瞄准',
						direction_z: '粒子板面沿方向矢量，未旋转的Y轴尝试向上瞄准',
					},
				}),
				material: new Input({
					id: 'particle_appearance_material',
					type: 'select',
					info: '选择粒子的材质',
					label: '材质',
					options: {
						particles_alpha: 'Alpha',
						particles_blend: 'Blend',
						particles_opaque: 'Opaque',
					},
				}),
			}
		},
		direction: {
			label: '方向',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'particle_direction_mode',
					type: 'select',
					info: '设置发射粒子相对于发射器形状的方向',
					label: '模式',
					mode_groups: ['particle', 'direction'],
					options: {
						outwards: '方向向外',
						inwards: '方向向内',
						direction: '自定义方向',
					},
				}),
				direction: new Input({
					id: 'particle_direction_direction',
					label: '方向',
					info: '发射粒子的方向，x/y/z',
					axis_count: 3,
					enabled_modes: ['direction']
				})
			}
		},
		motion: {
			label: '运动',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'particle_motion_mode',
					type: 'select',
					label: '模式',
					mode_groups: ['particle', 'motion'],
					options: {
						dynamic: '动态模式',
						parametric: '参数模式',
						static: '静态模式',
					},
				}),
				linear_speed: new Input({
					id: 'particle_motion_linear_speed',
					label: 'Speed',
					info: 'Starts the particle with a specified speed, using the direction specified by the emitter shape',
					enabled_modes: ['dynamic'],
					required: true
				}),
				linear_acceleration: new Input({
					id: 'particle_motion_linear_acceleration',
					label: 'Acceleration',
					info: 'The linear acceleration applied to the particle in blocks/sec/sec',
					axis_count: 3,
					enabled_modes: ['dynamic'],
				}),
				linear_drag_coefficient: new Input({
					id: 'particle_motion_linear_drag_coefficient',
					label: 'Air Drag',
					info: 'Think of this as air-drag.  The higher the value, the more drag evaluated every frame.',
					enabled_modes: ['dynamic']
				}),
				relative_position: new Input({
					id: 'particle_motion_relative_position',
					label: 'Offset',
					info: 'Directly set the position relative to the emitter',
					axis_count: 3,
					enabled_modes: ['parametric']
				}),
				direction: new Input({
					id: 'particle_motion_direction',
					label: 'Direction',
					info: 'Directly set the 3d direction of the particle',
					axis_count: 3,
					enabled_modes: ['parametric']
				}),
			}
		},
		rotation: {
			label: 'Rotation',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'particle_rotation_mode',
					type: 'select',
					label: 'Mode',
					mode_groups: ['particle', 'rotation'],
					options: {
						dynamic: 'Dynamic',
						parametric: 'Parametric',
					},
				}),
				initial_rotation: new Input({
					id: 'particle_rotation_initial_rotation',
					label: 'Start Rotation',
					info: 'Specifies the initial rotation in degrees',
					enabled_modes: ['dynamic']
				}),
				rotation_rate: new Input({
					id: 'particle_rotation_rotation_rate',
					label: 'Speed',
					info: 'Specifies the spin rate in degrees/second',
					enabled_modes: ['dynamic']
				}),
				rotation_acceleration: new Input({
					id: 'particle_rotation_rotation_acceleration',
					label: 'Acceleration',
					info: 'Acceleration applied to the rotation speed of the particle in degrees/sec/sec.',
					enabled_modes: ['dynamic']
				}),
				rotation_drag_coefficient: new Input({
					id: 'particle_rotation_rotation_drag_coefficient',
					label: 'Air Drag',
					info: 'Rotation resistance. Higher numbers will retard the rotation over time.',
					enabled_modes: ['dynamic']
				}),
				rotation: new Input({
					id: 'particle_rotation_rotation',
					label: 'Rotation',
					info: 'Directly set the rotation of the particle',
					enabled_modes: ['parametric']
				})
			}
		},
		lifetime: {
			label: 'Lifetime',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'particle_lifetime_mode',
					type: 'select',
					label: 'Mode',
					mode_groups: ['particle', 'lifetime'],
					options: {
						time: 'Time',
						expression: 'Kill Expression',
					}
				}),
				max_lifetime: new Input({
					id: 'particle_lifetime_max_lifetime',
					label: 'Max Age',
					info: 'Maximum age of the particle in seconds',
					value: 1,
					enabled_modes: ['time']
				}),
				kill_plane: new Input({
					id: 'particle_lifetime_kill_plane',
					label: 'Kill Plane',
					type: 'number',
					info: 'Particles that cross this plane expire. The plane is relative to the emitter, but oriented in world space. The four parameters are the usual 4 elements of a plane equation.',
					axis_count: 4
				}),
				expiration_expression: new Input({
					id: 'particle_lifetime_expiration_expression',
					label: 'Kill Expression',
					info: 'This expression makes the particle expire when true (non-zero)',
					enabled_modes: ['expression']
				}),
				expire_in: new Input({
					id: 'particle_lifetime_expire_in',
					label: 'Kill in Blocks',
					info: 'List of blocks to that let the particle expire on contact. Block IDs have a namespace and are separated by a space character.',
					placeholder: 'minecraft:stone',
					axis_count: -1,
					type: 'text'
				}),
				expire_outside: new Input({
					id: 'particle_lifetime_expire_outside',
					label: 'Only in Blocks',
					info: 'List of blocks outside of which the particle expires. Block IDs have a namespace and are separated by a space character.',
					placeholder: 'minecraft:air',
					axis_count: -1,
					type: 'text'
				}),
			}
		},
		texture: {
			label: 'Texture',
			_folded: true,
			inputs: {
				path: new Input({
					id: 'particle_texture_path',
					type: 'text',
					info: 'Path to the texture, starting from the texture pack. Example: textures/particle/snowflake',
					placeholder: 'textures/particle/particles',
					label: 'Texture',
					updatePreview: function() {
						updateMaterial()
					}
				}),
				image: new Input({
					id: 'particle_texture_image',
					type: 'image',
					allow_upload: !vscode,
					updatePreview: function(src) {
						updateMaterial()
					}
				}),
				mode: new Input({
					id: 'particle_texture_mode',
					type: 'select',
					label: 'UV Mode',
					mode_groups: ['particle', 'texture'],
					options: {
						static: 'Static',
						animated: 'Animated',
					},
				}),
				size: new Input({
					id: 'particle_texture_size',
					label: 'Texture Size',
					info: 'Resolution of the texture, used for UV mapping',
					type: 'number',
					axis_count: 2,
					required: true,
					value: [16, 16]
				}),
				uv: new Input({
					id: 'particle_texture_uv',
					label: 'UV Start',
					info: 'UV start coordinates',
					axis_count: 2,
					required: true,
					value: [0, 0]
				}),
				uv_size: new Input({
					id: 'particle_texture_uv_size',
					label: 'UV Size',
					info: 'UV size coordinates',
					axis_count: 2,
					value: [16, 16]
				}),
				uv_step: new Input({
					id: 'particle_texture_uv_step',
					label: 'UV Step',
					info: 'UV Offset per frame',
					axis_count: 2,
					enabled_modes: ['animated']
				}),
				frames_per_second: new Input({
					id: 'particle_texture_frames_per_second',
					label: 'FPS',
					info: 'Animation frames per second',
					type: 'number',
					enabled_modes: ['animated']
				}),
				max_frame: new Input({
					id: 'particle_texture_max_frame',
					label: 'Max Frame',
					info: 'Maximum amount of frames to draw from the flipbook',
					enabled_modes: ['animated']
				}),
				stretch_to_lifetime: new Input({
					id: 'particle_texture_stretch_to_lifetime',
					label: 'Stretch To Lifetime',
					type: 'checkbox',
					enabled_modes: ['animated']
				}),
				loop: new Input({
					id: 'particle_texture_loop',
					label: 'Loop',
					type: 'checkbox',
					enabled_modes: ['animated']
				}),
			}
		},
		color: {
			label: 'Color & Light',
			_folded: true,
			inputs: {
				mode: new Input({
					id: 'particle_color_mode',
					type: 'select',
					label: 'Color Mode',
					mode_groups: ['particle', 'color'],
					options: {
						static: 'Static',
						gradient: 'Gradient',
						expression: 'Expression',
					},
				}),
				picker: new Input({
					id: 'particle_color_static',
					label: 'Color',
					type: 'color',
					enabled_modes: ['static'],
					info: 'Set a static color for all emitted particles. Transparency is supported when the material is "Blend".'
				}),
				interpolant: new Input({
					id: 'particle_color_interpolant',
					label: 'Interpolant',
					info: 'Color Gradient Interpolant. Hint: use a curve here!',
					enabled_modes: ['gradient']
				}),
				range: new Input({
					id: 'particle_color_range',
					label: 'Range',
					info: 'Color Gradient Range',
					type: 'number',
					value: 1,
					enabled_modes: ['gradient']
				}),
				gradient: new Gradient({
					id: 'particle_color_gradient',
					label: 'Gradient',
					info: 'Gradient',
					type: 'gradient',
					enabled_modes: ['gradient']
				}),
				expression: new Input({
					id: 'particle_color_expression',
					label: 'Color',
					info: 'Set the color per particle using MoLang expressions in RGBA channels between 0 and 1. Alpha channel display is only supported with "Blend" material.',
					axis_count: 4,
					enabled_modes: ['expression']
				}),
				light: new Input({
					id: 'particle_color_light',
					label: 'Environment Lighting',
					type: 'checkbox',
				}),
			}
		},
		collision: {
			label: 'Collision',
			_folded: true,
			inputs: {
				enabled: new Input({
					id: 'particle_collision_enabled',
					label: 'Enabled',
					info: 'Enables collision when true / non-zero or unset',
				}),
				collision_drag: new Input({
					id: 'particle_collision_collision_drag',
					label: 'Collision Drag',
					info: 'Alters the speed of the particle when it has collided',
					type: 'number',
				}),
				coefficient_of_restitution: new Input({
					id: 'particle_collision_coefficient_of_restitution',
					label: 'Bounciness',
					info: 'Set to 0.0 to not bounce, 1.0 to bounce back up to original hight',
					type: 'number',
				}),
				collision_radius: new Input({
					id: 'particle_collision_collision_radius',
					label: 'Collision Radius',
					info: 'Used to minimize interpenetration of particles with the environment',
					max: 0.5,
					required: true,
					type: 'number',
				}),
				expire_on_contact: new Input({
					id: 'particle_collision_expire_on_contact',
					label: 'Expire On Contact',
					info: 'Removes the particle when it hits a block',
					type: 'checkbox',
				}),
			}
		}
	}
};


function forEachInput(cb) {
	for (var k_subject in Data) {
		for (var k_group in Data[k_subject]) {
			var group = Data[k_subject][k_group]
			if (typeof group === 'object') {
				for (var key in group.inputs) {
					if (group.inputs[key] instanceof Input) {
						cb(group.inputs[key], key)
					}
				}
			}
		}
	}
}
//Setup Data
forEachInput(input => {
	if (input.type === 'select') {
		input.update(Data)
	}
})

window.Data = Data;
export default Data
export {forEachInput}
