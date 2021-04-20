<template>
    <ul id="menu_bar">
        <li v-for="menu in Menu" :key="menu.id">
            <a>{{ menu.label }}</a>
            <ul class="menu_dropdown">
                <li v-for="entry in menu.children" :key="entry.id" v-on:click="entry.click(getVM(), $event)">
                    <a>{{ entry.label }}</a>
                </li>
            </ul>
        </li>
		<template v-if="isVSCExtension">
        	<li class="mode_selector" @click="openCodeViewer(true)" title="Open Code View to Side"><i class="unicode_icon split">{{'\u2385'}}</i></li>
        	<li class="mode_selector" @click="openCodeViewer(false)" title="Open as Code View">Open Code</li>
		</template>
		<template v-else-if="!portrait_view">
        	<li class="mode_selector code" :class="{selected: selected_tab == 'code'}" @click="$emit('changetab', 'code')">代码</li>
        	<li class="mode_selector preview" :class="{selected: selected_tab == 'preview'}" @click="$emit('changetab', 'preview')">预览</li>
		</template>
    </ul>
</template>

<script>
import {downloadFile} from '../export'
import {importFile,	loadPreset,	startNewProject} from '../import'
import {View} from './Preview'

import vscode from '../vscode_extension'
const isVSCExtension = !!vscode;

function openLink(link) {
	if (vscode) {
		vscode.postMessage({
            type: 'link',
            link
        });
	} else {
		open(link)
	}
}

const Menu = [
	{
		label: '文件',
		children: [
			{label: '新建文件', click: () => {startNewProject()}},
		]
	},
	{
		label: '示例',
		children: [
			{label: '加载粒子特效', 	click: () => {loadPreset('loading')}},
			{label: '彩虹粒子特效', 	click: () => {loadPreset('rainbow')}},
			{label: '下雨粒子特效', 	click: () => {loadPreset('rain')}},
			{label: '下雪粒子特效', 	click: () => {loadPreset('snow')}},
			{label: '火焰粒子特效', 	click: () => {loadPreset('fire')}},
			{label: '魔法粒子特效', 	click: () => {loadPreset('magic')}},
			{label: '轨迹粒子特效', 	click: () => {loadPreset('trail')}},
		]
	},
	{
		label: '查看',
		children: [
			{label: '网格开关', click: () => { View.grid.visible = !View.grid.visible }},
			{label: '辅助轴开关', click: () => { View.helper.visible = !View.helper.visible }},
			{label: '截图', click: () => { View.screenshot() }},
		]
	},
	{
		label: '帮助',
		children: [
			{label: 'MoLang表', click: (vm) => { vm.openDialog('molang_sheet') }},
			{label: '查看文档', click: () => { openLink('https://wiki.germmc.com/effect/particle_effect.html') }},
			{label: '加入我们', click: () => { openLink('https://qm.qq.com/cgi-bin/qm/qr?k=WWwS2yhy4pN8zU4M5gzpCs_EMBHERz41&authKey=%2BADaf3QRTB7fbSncvWbx03d0gWc6NjB%2FibtNu0ml%2Brx56AdEc5uLb6UapTGTMN5j&noverify=0&group_code=1055812097') }},
		]
	}
]

if (!isVSCExtension) {
	Menu[0].children.push(
		{label: '导入文件', click: () => {importFile()}},
		{label: '导出文件', click: () => {downloadFile()}}
	)
}



export default {
    name: 'menu-bar',
    props: {
        selected_tab: String,
        portrait_view: Boolean
    },
    methods: {
        changeTab() {
            this.$emit('setTab')
		},
		openCodeViewer(side) {
			vscode.postMessage({
				type: 'view_code', side
			});
		},
		openDialog(dialog) {
			this.$emit('opendialog', dialog)
		},
		getVM() {
			return this;
		}
	},
	data() {return {
		Menu,
		isVSCExtension
	}}
}
</script>


<style scoped>
	ul#menu_bar {
		height: 32px;
		font-weight: normal;
		padding: 0 8px;
		background-color: var(--color-bar);
		white-space: nowrap;
	}
	a {
		display: block;
		padding: 2px 12px; 
		padding-top: 3px;
	}
	a:hover {
		background-color: var(--color-interface);
		color: black;
	}
	ul#menu_bar > li {
		display: inline-block;
	}
	ul#menu_bar > li > ul {
		display: none;
		position: absolute;
		padding: 0;
		z-index: 8;
		min-width: 150px;
		background-color: var(--color-bar);
		box-shadow: 1px 4px 10px rgba(0, 0, 0, 0.25);
	}
	ul#menu_bar > li:hover > ul {
		display: block;
	}
	ul#menu_bar > li:hover > a {
		background-color: var(--color-interface);
	}
	.mode_selector {
		float: right;
		height: 100%;
		padding: 2px 8px;
		padding-top: 3px;
		cursor: pointer;
	}
	.mode_selector:hover {
		background-color: var(--color-interface);
	}
	.mode_selector.selected {
		background-color: var(--color-dark);
		color: var(--color-text_grayed);
	}
</style>
