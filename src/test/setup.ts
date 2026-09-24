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
	const { createElement, forwardRef, useImperativeHandle, useState } =
		jest.requireActual<typeof import('react')>('react');
	const { Pressable, View } = jest.requireActual<typeof import('react-native')>('react-native');

	return forwardRef(
		(
			{
				children,
				renderLeftActions,
				renderRightActions
			}: {
				children?: ReactNode;
				renderLeftActions?: () => ReactNode;
				renderRightActions?: () => ReactNode;
			},
			ref
		) => {
			const [isOpen, setIsOpen] = useState(false);

			useImperativeHandle(ref, () => ({
				close: () => setIsOpen(false),
				openLeft: jest.fn(),
				openRight: jest.fn(),
				reset: jest.fn()
			}));

			return createElement(
				View,
				null,
				createElement(
					Pressable,
					{
						accessibilityRole: 'button',
						accessibilityLabel: 'Mostrar acciones de swipe',
						onPress: () => setIsOpen(true)
					},
					'Abrir swipe'
				),
				isOpen ? renderLeftActions?.() : null,
				isOpen ? renderRightActions?.() : null,
				children
			);
		}
	);
});
