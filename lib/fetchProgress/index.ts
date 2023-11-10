import Progress from './progress';

export function isFetchProgressSupported() {
    return (
      typeof Response !== 'undefined' && typeof ReadableStream !== 'undefined'
    );
}

const FetchProgress = ({
    defaultSize = 0,
    emitDelay = 10,
    onProgress = (progress:any) => {},
    onComplete = (a:any) => {},
    onError = (a:any) => {},
}) => {

    return function FetchProgress(response: Response) {
        if (!isFetchProgressSupported()) {
          return response;
        }
        const { body, headers, status } = response;
        const contentLength = Number(headers.get('content-length')) || defaultSize;
        const progress = new Progress(contentLength, emitDelay);
        const reader = body!.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                  reader
                    .read()
                    .then(({ done, value }) => {
                      if (done) {
                        onComplete({});
                        controller.close();
                        return;
                      }
                      if (value) {
                        progress.flow(
                          value,
                          onProgress
                        );
                      }
                      controller.enqueue(value);
                      push();
                    })
                    .catch((err) => {
                      onError(err);
                    });
                }
        
                push();
            },
        });
    };
}

export default FetchProgress;