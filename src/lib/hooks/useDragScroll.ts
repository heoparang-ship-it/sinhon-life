"use client";
import { useCallback, useRef } from "react";

/**
 * PC 마우스로 가로 컨테이너를 클릭-드래그 스크롤하게 한다.
 * 콜백 ref 사용 — 요소가 늦게 마운트돼도 안전하게 리스너 연결.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const cleanupRef = useRef<(() => void) | null>(null);

  return useCallback((el: T | null) => {
    // 이전 요소 정리
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
      }
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

    cleanupRef.current = () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      el.removeEventListener("mouseleave", stop);
      el.removeEventListener("click", onClickCapture, true);
      el.style.cursor = "";
    };
  }, []);
}
