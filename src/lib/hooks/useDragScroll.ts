"use client";
import { useEffect, useRef } from "react";

/**
 * PC 마우스로 가로 컨테이너를 클릭-드래그 스크롤할 수 있게 한다.
 * 터치 디바이스는 native 스크롤이 이미 동작하므로 영향 없음.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    };

    const stop = () => {
      isDown = false;
      el.style.cursor = "grab";
    };

    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onDragStart = (e: DragEvent) => e.preventDefault();

    // 자식 img/a 의 기본 드래그도 막기
    el.querySelectorAll("img, a").forEach((node) => {
      (node as HTMLElement).setAttribute("draggable", "false");
    });

    el.style.cursor = "grab";
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("dragstart", onDragStart);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    el.addEventListener("mouseleave", stop);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      el.removeEventListener("mouseleave", stop);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return ref;
}
