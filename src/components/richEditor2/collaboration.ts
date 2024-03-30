/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import { Doc } from 'yjs';
import { GetCurrentPath } from '@/lib/tool';

const WEBSOCKET_ENDPOINT = 'ws://localhost:1234';
const WEBSOCKET_SLUG = 'collab';

// parent dom -> child doc
export function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Doc>,
  token: string,
  type: string,
  user: string
  // token: string
): WebsocketProvider {
  if (token=="" || user=="" || id=="" || type=="") {
    const href = GetCurrentPath();
    window.location.href = href+"/error";
    // @ts-ignore
    return null;
  } else {
    const doc = new Doc();
    // @ts-ignore
    yjsDocMap.set(id, doc);
    const provider = new WebsocketProvider(
      WEBSOCKET_ENDPOINT,
      WEBSOCKET_SLUG + '/' + id + '/' + type,
      doc,
      { connect: false, params: {t: token, v: user} },
    );
    new IndexeddbPersistence(
      id,
      // @ts-ignore
      doc
    );
    // provider.on('connect', () => {  
    //   console.log('WebSocket connected');  
    // });  
      
    // provider.on('disconnect', (code, reason) => {  
    //   console.log(typeof code, typeof reason,  "===disconnect===");
    //   console.log('WebSocket disconnected', code, reason);  
    // });  
      
    // provider.on('error', (error) => {  
    //   console.log(typeof error, "===error===");
      
    //   console.error('WebSocket error', error);  
    // });
    return provider;
  }
}

// import * as Y from "yjs";
// import {Provider} from '@lexical/yjs';
// import { HocuspocusProvider, TiptapCollabProvider, HocuspocusProviderWebsocket, onStatusParameters } from "@hocuspocus/provider";
// const socket = new HocuspocusProviderWebsocket({
//   url: `ws://localhost:1234`,
//   connect: false,
// });

// export function createWebsocketProvider2(
//   id: string,
//   yjsDocMap: Map<string, Y.Doc>,
//   token: string
// ): Provider {
//   const doc = new Y.Doc();
//   yjsDocMap.set(id, doc);

//   // @ts-ignore
//   return new HocuspocusProvider({
//     websocketProvider: socket,
//     name: `test-${id}`,
//     document: doc,
//     token: "my-access-token",
//     onSynced: () => {
//       console.log("HocuspocusProvider synced");
//     },
//     onDisconnect: () => {
//       console.log("HocuspocusProvider disconnect");
//     },
//     onConnect: () => {
//       console.log("HocuspocusProvider onConnect");
//     },
//     onStatus: (data: onStatusParameters) => {
//       console.log(data, "onStatus");
//     }
//   });
// }


// export function createWebsocketProvider(
//   id: string,
//   yjsDocMap: Map<string, Y.Doc>
// ): Provider {
//   const doc = new Y.Doc();
//   yjsDocMap.set(id, doc);

// // @TODO: REPLACE APP ID
// // @TODO: PUT PROPER TOKEN
// // @TODO: OR USE `HocuspocusProvider` with Hocuspocus URL
//   const hocuspocusProvider = new TiptapCollabProvider({
//     appId: 'YOUR_APP_ID',
//     name: `lexical-${id}`,
//     token: 'YOUR_TOKEN',
//     document: doc,
//   });

//   return hocuspocusProvider;
// }