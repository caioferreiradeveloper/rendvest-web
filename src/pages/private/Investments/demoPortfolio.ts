export const positions = [
  { category: 'Fundos imobiliários', example: 'HGLG11 e KNCR11', amount: 8640 },
  { category: 'Ações', example: 'ITUB4 e PETR4', amount: 7200 },
  { category: 'Tesouro Direto', example: 'Tesouro IPCA+ e Tesouro Prefixado', amount: 6800 },
  { category: 'Tesouro Selic', example: 'Título público atrelado à Selic', amount: 5400 },
  { category: 'Renda fixa atrelada ao CDI', example: 'CDB a 100% do CDI', amount: 4000 },
];

export const portfolioTotal = positions.reduce((total, position) => total + position.amount, 0);
