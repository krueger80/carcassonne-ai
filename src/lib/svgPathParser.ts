/**
 * SVG path parser/serializer for the tile editor.
 * Only handles M, L, Q, Z commands (no arcs, cubics, or relative commands).
 */

export interface PathCommand {
  type: 'M' | 'L' | 'Q' | 'Z'
  /** Endpoint x (M, L, Q) */
  x?: number
  /** Endpoint y (M, L, Q) */
  y?: number
  /** Quadratic control-point x (Q only) */
  cx?: number
  /** Quadratic control-point y (Q only) */
  cy?: number
}

/**
 * Parse an SVG path `d` string into an array of commands.
 * Coordinates are rounded to integers.
 */
export function parseSvgPath(d: string): PathCommand[] {
  const commands: PathCommand[] = []
  // Split on command letters, keeping the letter
  const tokens = d.match(/[MLQZ][^MLQZ]*/gi)
  if (!tokens) return commands

  for (const token of tokens) {
    const type = token[0].toUpperCase() as PathCommand['type']
    const nums = token.slice(1).trim().match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? []

    switch (type) {
      case 'M':
      case 'L':
        if (nums.length >= 2) {
          commands.push({ type, x: Math.round(nums[0]), y: Math.round(nums[1]) })
        }
        break
      case 'Q':
        if (nums.length >= 4) {
          commands.push({
            type,
            cx: Math.round(nums[0]),
            cy: Math.round(nums[1]),
            x: Math.round(nums[2]),
            y: Math.round(nums[3]),
          })
        }
        break
      case 'Z':
        commands.push({ type: 'Z' })
        break
    }
  }
  return commands
}

/**
 * Serialize an array of path commands back into an SVG `d` string.
 */
export function serializeSvgPath(commands: PathCommand[]): string {
  return commands
    .map((cmd) => {
      switch (cmd.type) {
        case 'M':
        case 'L':
          return `${cmd.type}${cmd.x},${cmd.y}`
        case 'Q':
          return `Q${cmd.cx},${cmd.cy} ${cmd.x},${cmd.y}`
        case 'Z':
          return 'Z'
      }
    })
    .join(' ')
}
