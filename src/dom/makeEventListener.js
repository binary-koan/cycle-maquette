import Rx from "rx";

const disposableCreate = Rx.Disposable.create;
const CompositeDisposable = Rx.CompositeDisposable;
const AnonymousObservable = Rx.AnonymousObservable;

function createListener({ element, eventName, handler, useCapture }) {
  if (element.addEventListener) {
    element.addEventListener(eventName, handler, useCapture);
    return disposableCreate(() => {
      element.removeEventListener(eventName, handler, useCapture);
    });
  }
  throw new Error("No listener found");
}

function createEventListener({ element, eventName, handler, useCapture }) {
  const disposables = new CompositeDisposable();

  if (Array.isArray(element)) {
    for (let i = 0, len = element.length; i < len; i++) {
      disposables.add(
        createEventListener({
          element: element[i],
          eventName,
          handler,
          useCapture
        })
      );
    }
  } else if (element) {
    disposables.add(createListener({ element, eventName, handler, useCapture }));
  }
  return disposables;
}

export default function makeEventListener(element, eventName, useCapture = false) {
  return new AnonymousObservable((observer) =>
    createEventListener({
      element,
      eventName,
      handler: (data) => {
        observer.onNext(data);
      },
      useCapture
    })
  ).share();
}
