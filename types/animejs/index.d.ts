declare module "animejs" {
  interface AnimeParams {
    keyframes?: Array<Record<string, unknown>>;
    duration?: number;
    ease?: string;
  }

  interface AnimeInstance {
    pause(): void;
    play(): void;
    restart(): void;
    cancel(): void;
  }

  export function animate(
    targets: unknown,
    parameters: AnimeParams,
  ): AnimeInstance;

  export function remove(targets: unknown): void;
}
