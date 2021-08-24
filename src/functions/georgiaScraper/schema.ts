export default {
  type: 'object',
  properties: {
    drawDate: { type: 'string' },
    drawName: { type: 'string' },
    drawTime: { type: 'string' },
  },
  required: ['drawDate', 'drawName', 'drawTime'],
} as const;
