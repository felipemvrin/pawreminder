import { colors, radius, spacing, typography } from './tokens';

describe('design tokens', () => {
  it('exposes the required semantic token groups', () => {
    expect(colors.primary).toBeDefined();
    expect(spacing[4]).toBe(16);
    expect(radius.full).toBe(9999);
    expect(typography.body.fontSize).toBe(16);
  });
});
