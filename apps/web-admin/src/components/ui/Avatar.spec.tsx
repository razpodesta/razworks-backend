// INICIO DEL ARCHIVO [apps/web-admin/src/components/ui/Avatar.spec.tsx]
/**
 * @fileoverview Test de Componente Local
 * @description Valida que el Avatar funcione sin dependencias externas.
 */
import { render } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Local UI: Avatar', () => {
  it('renderiza fallback correctamente', () => {
    const { getByText } = render(<Avatar alt="Lia Legacy" />);
    // "Li" son las dos primeras letras de "Lia Legacy"
    expect(getByText('Li')).toBeTruthy();
  });

  it('aplica clases de Tailwind via cn()', () => {
    const { container } = render(<Avatar alt="Test" className="bg-red-500" />);
    // Verifica que la clase se pasó y se fusionó
    expect(container.firstChild).toHaveClass('bg-red-500');
  });
});
// FIN DEL ARCHIVO [apps/web-admin/src/components/ui/Avatar.spec.tsx]
