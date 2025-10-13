<script lang="ts">
	const i18n = getContext('i18n');
	import { getContext } from 'svelte';
	import { settings } from '$lib/stores';
	export let id = 'password-input';
	export let value: string = '';
	export let placeholder = '';
	export let type = 'text';
	export let required = true;
	export let readOnly = false;
	export let outerClassName = 'flex flex-1 bg-transparent';
	export let inputClassName = 'w-full text-sm py-0.5 bg-transparent';
	export let showButtonClassName = 'pl-1.5  transition bg-transparent';

	let show = false;
</script>

<div class={outerClassName}>
	<label class="sr-only" for={id}>{placeholder || $i18n.t('Password')}</label>
	<input
		{id}
		class={`${inputClassName} ${show ? '' : 'password'} ${($settings?.highContrastMode ?? false) ? 'placeholder:text-gray-700 dark:placeholder:text-gray-100' : ' outline-hidden placeholder:text-gray-300 dark:placeholder:text-gray-600'}`}
		{placeholder}
		type={type === 'password' && !show ? 'password' : 'text'}
		{value}
		required={required && !readOnly}
		disabled={readOnly}
		on:change={(e) => {
			value = e.target.value;
		}}
		autocomplete="off"
	/>
	<button
		class={showButtonClassName}
		type="button"
		aria-pressed={show}
		aria-label={$i18n.t('Make password visible in the user interface')}
		on:click={(e) => {
			e.preventDefault();
			show = !show;
		}}
	>
		<span class="text-xs font-bold text-gray-600 dark:text-gray-400">AO</span>
	</button>
</div>
