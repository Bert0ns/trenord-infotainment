import { render } from '@testing-library/react-native';

import { ThemedText } from '@/components/themed-text';

jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#ff0000',
}));

describe('ThemedText', () => {
  it('renders text content', () => {
    const { getByText } = render(<ThemedText>Hello</ThemedText>);

    expect(getByText('Hello')).toBeTruthy();
  });

  it('includes the themed color in style', () => {
    const { getByText } = render(<ThemedText>Styled</ThemedText>);
    const instance = getByText('Styled');

    expect(instance.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: '#ff0000' })])
    );
  });
});
