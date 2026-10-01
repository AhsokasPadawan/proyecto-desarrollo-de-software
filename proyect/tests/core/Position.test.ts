import { describe, expect, it } from 'vitest';
import { Position } from '../../src/core/board/Position';

describe('Position', () => {
  it('creates an immutable instance with row and col coordinates', () => {
    const position = new Position(3, 4);

    expect(position.row).toBe(3);
    expect(position.col).toBe(4);
  });

  it('throws an error if row coordinate is not an integer', () => {
    expect(() => new Position(1.5, 2)).toThrow();
  });

  it('throws an error if col coordinate is not an integer', () => {
    expect(() => new Position(1, NaN)).toThrow();
  });

  it('allows coordinates beyond standard 8x8 boundaries', () => {
    const position = new Position(12, 15);

    expect(position.row).toBe(12);
    expect(position.col).toBe(15);
  });

  it('calculates a new position via offset', () => {
    const origin = new Position(2, 3);

    const target = origin.offset(2, -1);

    expect(target.row).toBe(4);
    expect(target.col).toBe(2);
    expect(origin.row).toBe(2);
    expect(origin.col).toBe(3);
  });

  it('returns true when comparing equal positions by value', () => {
    const first = new Position(4, 5);
    const same = new Position(4, 5);

    const result = first.equals(same);

    expect(result).toBe(true);
  });

  it('returns false when comparing differing positions by value', () => {
    const first = new Position(4, 5);
    const different = new Position(4, 6);

    const result = first.equals(different);

    expect(result).toBe(false);
  });

  it('converts bottom-left position to algebraic notation', () => {
    const position = new Position(0, 0);

    const notation = position.toAlgebraic();

    expect(notation).toBe('a1');
  });

  it('converts standard coordinate to algebraic notation', () => {
    const position = new Position(1, 4);

    const notation = position.toAlgebraic();

    expect(notation).toBe('e2');
  });

  it('converts top-right coordinate to algebraic notation', () => {
    const position = new Position(7, 7);

    const notation = position.toAlgebraic();

    expect(notation).toBe('h8');
  });

  it('parses bottom-left position from algebraic notation', () => {
    const position = Position.fromAlgebraic('a1');

    expect(position.equals(new Position(0, 0))).toBe(true);
  });

  it('parses standard position from algebraic notation', () => {
    const position = Position.fromAlgebraic('e2');

    expect(position.equals(new Position(1, 4))).toBe(true);
  });

  it('parses top-right position from algebraic notation', () => {
    const position = Position.fromAlgebraic('h8');

    expect(position.equals(new Position(7, 7))).toBe(true);
  });

  it('throws an error when parsing empty algebraic string', () => {
    expect(() => Position.fromAlgebraic('')).toThrow();
  });

  it('throws an error when parsing invalid algebraic format', () => {
    expect(() => Position.fromAlgebraic('invalid')).toThrow();
  });

  it('throws an error when algebraic column letter is missing row digits', () => {
    expect(() => Position.fromAlgebraic('e')).toThrow();
  });

  it('throws an error when algebraic row digits precede column letter', () => {
    expect(() => Position.fromAlgebraic('1e')).toThrow();
  });
});
