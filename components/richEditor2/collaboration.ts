/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { IndexeddbPersistence } from "y-indexeddb";
import {Provider} from '@lexical/yjs';
import {WebsocketProvider} from './utils/y-websocket-auth';
import {Doc} from 'yjs';

const WEBSOCKET_ENDPOINT = 'ws://localhost:1234';
const WEBSOCKET_SLUG = 'playground';
// const WEBSOCKET_ID = params.get('collabId') || '0';

// parent dom -> child doc
export function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Doc>,
): Provider {
  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = new Doc();
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }

  // new IndexeddbPersistence(
  //   id,
  //   // @ts-ignore
  //   doc
  // );

  const wsProvider = new WebsocketProvider(
    WEBSOCKET_ENDPOINT,
    id,
    doc,
    {
      connect: false,
      auth: "auth-token"
    }
  );
  wsProvider.on('status', (event: any) => {
    console.log(event.status) // logs "connected" or "disconnected"
  })
  // @ts-ignore
  return wsProvider;
}

// import * as Y from "yjs";
// import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
// const socket = new HocuspocusProviderWebsocket({
//   url: `ws://localhost:1234`,
//   connect: false,
// });

// export function createWebsocketProvider(
//   id: string,
//   yjsDocMap: Map<string, Y.Doc>
// ): Provider {
//   const doc = new Y.Doc();
//   yjsDocMap.set(id, doc);

//   // @ts-ignore
//   return new HocuspocusProvider({
//     websocketProvider: socket,
//     name: `test-${id}`,
//     document: doc,
//     onSynced: () => {
//       console.log("synced");
//     },
//   });
// }