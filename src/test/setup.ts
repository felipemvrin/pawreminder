import type { ReactNode } from 'react';

jest.mock('moti', () => {
	const { createElement } = jest.requireActual<typeof import('react')>('react');
	const { View } = jest.requireActual<typeof import('react-native')>('react-native');

	return {
		MotiView: ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) =>
			createElement(View, props, children)
	};
});

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
	const { createElement } = jest.requireActual<typeof import('react')>('react');
	const { View } = jest.requireActual<typeof import('react-native')>('react-native');

	return ({
		children,
		renderLeftActions,
		renderRightActions
	}: {
		children?: ReactNode;
		renderLeftActions?: () => ReactNode;
		renderRightActions?: () => ReactNode;
	}) =>
		createElement(
			View,
			null,
			renderLeftActions?.(),
			renderRightActions?.(),
			children
		);
});
