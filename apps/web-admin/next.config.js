//@ts-check

const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // FIX: Eliminamos 'svgr: false' ya que no existe en el tipo WithNxOptions actual.
  // Dejamos el objeto nx vacío o con propiedades válidas si se requieren en el futuro.
  nx: {},

  // Configuración vital para el Monorepo
  transpilePackages: ['@razworks/security', '@razworks/ui', '@razworks/dtos'],
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
