---
title: Angular components, smart when it pays, dumb on purpose
date: 2026-05-28
excerpt: Smart vs dumb components in Angular — the boundary, the one-line test, and the cost of drawing it too early.
tags: [angular, components, architecture]
readTime: 18
bannerId: c04326f0-f8b2-4d33-ae30-281886cd2798
bannerAlt: a close up of a watch on a white surface
bannerCredit: Photo by [Andreas Bentele](https://unsplash.com/photos/a-close-up-of-a-watch-on-a-white-surface-bwkJ-nbPkTo)
---

**TL;DR.** Smart components own state, services, and decisions — dumb components own inputs and pixels, nothing else. The test fits on one line: delete every `inject()` from a component, if it still compiles it's dumb, if it breaks it's smart. The boundary is universal, the cost is not — for one-off UI or throwaway prototypes the split is overhead, but earns itself the moment a component absorbs more than one concern. The post walks the split across features and shells with a worked example (flat comment thread with optimistic mutations) and the anti-patterns to flag in code review. Code examples use Angular 20+ for concrete syntax, but the architectural approaches apply to any component-based framework — mechanisms differ, the boundary doesn't.

**Out of scope** — these topics the post touches but does not deep-dive:

- **State management implementation** — the worked example stubs HTTP and optimistic mutation. Library choice (NgRx, Akita, etc.) and persistence layer stay out.
- **Performance optimization** — `OnPush` and signal-driven change detection are explained as part of the boundary. Measurement methodology stays out.

## What goes wrong

Frontends accumulate responsibility. A component that started by rendering a list grows over time to fetch data, hold filter state, format values, and emit analytics. Editing it becomes expensive — changes spread across many places, refactors touch multiple files, and a new contributor has to read several files of imports before a small change is safe.

Three failure modes recur.

**Logic spreads.** Business rules accumulate across templates, lifecycle hooks, event handlers, services, and directives without a single owner. Reading a feature means assembling fragments from several files. Refactors require tracing every callsite to be confident the change is complete.

**State leaks.** A component owns state that two siblings need, so a parent grows a copy. The copy drifts from the source, and bugs follow. The team responds by adding a store, which often ends up holding view-specific flags (drawer open, filter chip hovered) that should not survive a navigation.

**Performance regresses silently.** Components rerender on every keystroke when they take object inputs that become new references each render. Change detection cost accumulates. Dev machines often hide it. Lower-end mobile devices don't. By the time someone profiles, the regression spans many components.

None of this is a framework problem. It is a boundary problem.

## Drawing the line

Every component picks a side. A **dumb component** knows about pixels — inputs in, events out, template renders. A **smart component** knows about the world — services, state, HTTP, what to render, when. One job each.

The split predates Angular. Dan Abramov sketched it for React in 2015 as [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0). A 2019 editor's note pinned to that post walks it back, citing Hooks as the new separation tool and the rule being *"enforced without any necessity and with almost dogmatic fervor."* The retraction matters less in Angular — Hooks don't apply, DI is still the separation tool, and the readability contract holds: dumb files raise no "where does this data come from?" question, smart files expect injections and lifecycle. The split is not the goal — a clear owner per concern is. Skip it when the file stays small and holds one concern. Apply it when the component absorbs more concerns. A second contributor on top of unclear boundaries compounds the cost.

The test is one line: **delete every feature-state `inject()` call. Does it still compile?** Yes → dumb. No → smart. Framework primitives — `ElementRef`, `Renderer2`, `DestroyRef` — don't count, they handle the component's own scope and infrastructure, not feature state. A component that needs one surviving feature `inject()` to compile is probably a smart component in costume. Split it.

| Aspect           | Dumb                          | Smart                              |
|------------------|-------------------------------|------------------------------------|
| **Talks to**     | nothing                       | services, nav, store, route        |
| **Inputs**       | narrow data — `[canEdit]`, `[comment]` | scope only — `[subjectId]`, `[mode]`|
| **Outputs**      | intent — `(edited)`, `(deleted)`       | rare — emit when needed             |
| **State**        | visual                        | feature                            |
| **Reused**       | across features               | scope-parameterized, one concern   |

Class names in the snippets below encode responsibility as a suffix — `Feat` for smart components, `Ui` for dumb primitives. The [Angular 20+ style guide](https://angular.dev/style-guide#naming) no longer requires `Component`, `Service`, or `Pipe` suffixes — `Feat`/`Ui` is a separate, opt-in project convention. Skip it if it feels like overhead. The payoff is mechanical enforcement — ESLint rules use the suffix as an anchor to apply boundary constraints automatically, no manual code review needed. The same convention can extend to selectors for full visibility from the template too.

Four rules survive outside the table because they are the most violated in code review:

- **Dumb components don't inject feature state.** Feature state = data your domain owns (comments, posts, auth) — anything that survives a reload, not visual flags. Framework primitives like `ElementRef` are fine because they don't reach feature state. One feature `inject()` in a dumb component and the boundary is gone.
- **Smart components don't render visual detail directly.** Formatting, animation, focus management, ARIA, DOM measurements — all dumb-child or directive territory. Smart composes them declaratively, never implements them.
- **Side effects are smart-only.** Side effects = HTTP calls, navigation, state writes, persistence, analytics — anything outside the component. Dumb emits intents like `(edited)`, smart decides what they become. That separation keeps dumb reusable across contexts.
- **Smart components don't take data inputs.** Smart inputs name *which thing* — `[subjectId]`, `[mode]`. Data inputs like `[items]: Item[]`, `[currentUser]`, `[loading]`/`[error]` are smells — the smart should fetch, inject, or derive these itself. If a smart's input list reads like dumb inputs, the split has collapsed.

These rules describe the **end state at scale**, not the starting point. **Start smart and split as growth demands** — when the component absorbs more concerns, when visual state piles up, when the same shape repeats. A second contributor on top of unclear boundaries compounds the cost. Splitting too early can be overhead. See [§The discipline](#the-discipline) for thresholds.

## Dumb components

A dumb component is a pure mapping from inputs to DOM. Same inputs always render the same output. Template renders, `OnPush` keeps the math honest by skipping work when input references haven't changed. Prefer narrow, case-specific inputs — `[canEdit]` not `[currentUser]`, `[label]` not `[localeService]`. The smart resolves context first, dumb receives the resolved primitives.

**Pays.** Most when a component has many consumers. The constraint forces a clear responsibility boundary — `CommentUi` rendered across post pages, photo pages, profile feeds, and moderation queues stays one definition, not branches that diverge per context. Reusability scales with the consumer count, not against it. Tests stay simple, isolation tools work first try, refactors travel through type errors.

**Costs.** The contract surface grows — each visual variant adds an input, each control adds an output, and parents wire all of them. Sometimes feels like overhead. The payoff: same inputs always render the same output, so tests stay simple even as the surface widens.

**Flips.** A dumb component reaching for context — whether by injecting a service directly or by accepting too many context-shaped inputs (full `user`, `locale`, `featureFlags`) — is asking the smart parent above to take ownership. Resolve at the smart layer, pass only the result down (a primitive boolean, a string, a label). Build a thicker smart, not a leakier dumb.

```ts:src/app/comments/comment.ui.ts
@Component({
  selector: 'app-comment-ui',
  imports: [RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article>
      <header>
        <strong>{{ comment().author }}</strong>
        <time>{{ comment().createdAt | relativeTime }}</time>
      </header>
      <p>{{ comment().body }}</p>
    </article>
  `,
})
export class CommentUi {
  readonly comment = input.required<Comment>();
}
```

This v1 is the simplest dumb shape — one input, pure display, no events. Edit/delete buttons and identity-based permissions come later as v2 in [§Worked example](#worked-example).

The same `CommentUi` works on a post detail page, photo detail, profile activity feed, or moderation queue — anywhere a parent has a `Comment` to render. The row never asks "who is the current user?", "is this thread locked?", "should I track this view?" Those questions belong to the smart parent.

Dumb components share domain types with state, but never internals. The shape is open for full data surface, but inputs should stay narrow and case-specific.

Pure transforms like `relativeTime` belong in dumb (no DI, just formatting). The line breaks the moment a pipe needs services, business rules, or moderation logic — that's smart territory.

## Smart components

A smart component is where decisions live. It injects services, owns state, decides what to render, and binds dumb children. The template stays at structural directives plus delegated handlers.

**Pays.** Most when the view depends heavily on business logic — multiple variants of the same screen splitting on identity, role, mode, or state. The smart parent owns the decision in one place, dumb children render the chosen variant. The same smart can be reused across scopes (different `[subjectId]`, `[mode]`), but never across concerns — one smart, one concern. Without the split, business logic spreads across template, class, and helpers — every behavior change touches several files. The boundary keeps the smart's concern narrow: one place owns what the UI shows under what condition.

**Costs.** Splitting multiplies file count — a smart-plus-dumb-children setup needs more files, more wiring, more tests for simple changes. Up-front cost is real. Long-term, maintainability compounds — each concern lives in one place, behaviors stay predictable, onboarding new contributors gets faster.

**Flips.** Two signals say the smart is absorbing dumb-side work. Data inputs — `[items]: Item[]`, `[currentUser]`, anything that should be injected — never enter a smart, fetch them through DI instead. Visual state — hover, current tab, animation phase, panel open or closed — never sits on a smart, push it down to the dumb child that renders it. A smart that accepts data inputs or grows visual flags lands as a fatter file and harder reviews.

```ts:src/app/post-detail/post-detail.feat.ts
@Component({
  selector: 'app-post-detail-feat',
  imports: [CommentUi, SpinnerUi, ErrorBannerUi, DatePipe],
  providers: [CommentsState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article>
      <header>
        <h1>{{ post().title }}</h1>
        <time [attr.datetime]="post().date">{{ post().date | date:'longDate' }}</time>
      </header>
      <ng-content />
    </article>

    @if (comments.loading()) {
      <app-spinner-ui />
    } @else if (comments.error(); as message) {
      <app-error-banner-ui [message]="message" />
    } @else {
      @for (comment of comments.list(); track comment.id) {
        <app-comment-ui [comment]="comment" />
      } @empty {
        <p>No comments yet.</p>
      }
    }
  `,
})
export class PostDetailFeat {
  protected readonly post = inject(PostState).current;
  protected readonly comments = inject(CommentsState);

  constructor() {
    this.comments.load(this.post().id);
  }
}
```

This v1 covers the common shape — provider-scoped state, load in the constructor, signal-driven template branches. Edit mode and per-row permissions (`canEdit`, `canDelete`) come later as v2 in [§Worked example](#worked-example).

**Provider scope keeps state honest.** Scoping `CommentsState` to the smart via the `providers` array means the state lives only while the page is mounted. Navigate away, state goes. No cleanup boilerplate, no stale state across views.

**Stores cost what they save.** Lift to a store when a second smart needs the state, or when data needs to persist beyond the view (caching across navigations). Otherwise single-consumer is overhead — stack traces grow, test surface splits.

**Loading, error, and empty are domain state.** Smart owns the booleans, dumb renders the variant. Smart sets `loading.set(true)`, the spinner element belongs in the dumb child.

> **Optional further split.** Teams running stricter splits add a third suffix — `-page` for orchestrators (route-level glue, composition only) on top of `-feat` for the work. Same boundary rules, one level up.

## Wiring it up

Data flows down. Events flow up. Shared state lives in a store. Three patterns cover almost every case.

**Smart → dumb: `input()`.** Typed, declarative, structural. The smart parent owns the data. The dumb child receives it. Use `input.required<T>()` when the input is mandatory — forgetting to bind becomes a compile error rather than a runtime "undefined".

**Smart ← dumb: `output()`.** Events bubble one level. The dumb child names *what happened* — `(edited)`, `(deleted)`, `(submitted)`. The smart parent decides *what to do about it* — mutate state, call an API, log an event.

**Smart ↔ smart: an injected store.** Two smart components in different parts of the tree — a header and a drawer, a sidebar and a main panel — both inject the same store that holds the signal. No `EventEmitter` chains, no "ping-pong through parent". The store is the source of truth, components are consumers, none of them has to know about the others.

Pick the pattern with the cheapest cost for the actual coupling, not the one that looks cleanest in isolation.

Two anti-patterns to flag in code review.

**Dumb-to-dumb shouts via parent.** If two siblings need to coordinate beyond "click → emit → parent reroutes", they are not actually dumb. Either one of them is doing smart work, or there is a missing service holding the shared signal.

**Smart inside dumb.** A dumb component that imports a smart one poisons the boundary — every consumer of the dumb now drags the smart child's dependencies along. If a dumb component "needs" a smart child, the parent above is the one that should compose it.

> **Exception — content projection bends "smart inside dumb".** A dumb shell hosts whatever the parent projects — including a smart child — as long as the shell never imports, types, or queries it.

A dumb shell declares `<ng-content>` slots and types nothing about what fills them. The smart parent above decides what lands inside — and may project a smart child without dragging its dependencies into the shell.

The boundary is preserved by **what the dumb component imports and types**, not by what renders inside it. Direct child import crosses the line. Content projection does not. That is what makes layout shells, dialogs, cards, and panels reusable across smart and dumb consumers.

## Worked example

The smart and dumb intros showed `PostDetailFeat` loading and listing comments, and `CommentUi` as the row primitive. The worked example completes the picture: the state holder behind `CommentsState`, the editor primitive `CommentEditorUi`, and the additions `PostDetailFeat` needs to handle edit mode, identity, and the editor at the thread head. One editor instance, swapped per row.

The wiring touches every layer. A state holder owns truth, HTTP, and optimistic mutation. Two dumb children render — the row from [§Dumb](#dumb-components) plus a new editor primitive — and the smart parent grows handlers for `add`, `edit`, `remove`.

```text
┌────────────────────────────────┐                            ┌────────────────────────────────┐
│         PostDetailFeat         │                            │         CommentsState          │
├────────────────────────────────┤  list()/loading()/error()  ├────────────────────────────────┤
│  provides CommentsState        │◀───────────────────────────│  signal<Comment[]>             │
│  injects PostState, CurrentUser│───────────────────────────▶│  HTTP + optimistic mutation    │
│  local: editingId signal       │    add/edit/remove(id)     └────────────────────────────────┘
└────────────────────────────────┘
   │▲                           │▲
   ││                           ││
   ││ [content]                 ││ [comment] [canEdit] [canDelete]
   ││ (submitted) (cancelled)   ││ (edited) (deleted)
   ││                           ││
   ▼│                           ▼│
┌────────────────────────────┐ ┌────────────────────────────────┐
│      CommentEditorUi       │ │           CommentUi            │
├────────────────────────────┤ ├────────────────────────────────┤
│ input<string> content      │ │  input<Comment> comment        │
│ output<string> submitted   │ │  input<boolean> canEdit        │
│ output<void> cancelled     │ │  input<boolean> canDelete      │
│ local: draft               │ │  output<void> edited           │
└────────────────────────────┘ │  output<void> deleted          │
                               │  pure display, no local state  │
                               └────────────────────────────────┘
```

The smart parent owns the edit-mode signal and swaps `<app-comment-editor-ui>` for `<app-comment-ui>` on the row being edited. One editor primitive, one architectural level, no duplication.

**The state.** Provided by the smart parent, scoped to the page — the state lives only while `PostDetailFeat` is mounted, and `load(subjectId)` resolves fresh on navigation.

```ts:src/app/comments/comment.types.ts
export interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}
```

```ts:src/app/comments/comments.state.ts
@Injectable()
export class CommentsState {
  private readonly api = inject(CommentsApi);
  private readonly _list = signal<Comment[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly list = this._list.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async load(subjectId: string): Promise<void> {
    // set loading, fetch, set list or error
  }

  async add(subjectId: string, body: string): Promise<void> {
    // optimistic insert, POST, rollback on error
  }

  async edit(id: string, body: string): Promise<void> {
    // optimistic patch, PUT, rollback on error
  }

  async remove(id: string): Promise<void> {
    // optimistic remove, DELETE, restore on error
  }
}
```

`Comment` is the domain entity — exported and shared with dumb components. The state's mutation methods are public on the class, but only the smart parent calls them — visibility convention enforced by the boundary rule, not by language. Optimistic UI lives inside the state, not the smart parent: the contract is patch first, await the network, roll back on rejection. The smart parent never sees the intermediate states — it reads `list()` and trusts the optimistic shape.

Scope cost: scoping `CommentsState` to `PostDetailFeat` means siblings that need the same thread (e.g. a sidebar count on the dashboard) cannot read the live signal. They re-fetch through the API, with whatever cache the HTTP service offers. If a sibling needs the count without re-fetching, the provider hoists. [§When features keep landing](#when-features-keep-landing) covers the lift.

**The dumb comment editor.** One input for the existing content, two outputs for submit and cancel. Owns its own draft — visual state lives where it renders.

```ts:src/app/comments/comment-editor.ui.ts
@Component({
  selector: 'app-comment-editor-ui',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <textarea
        [(ngModel)]="draft"
        required
      ></textarea>
      <button type="button" [disabled]="!draft().trim()" (click)="onSubmit()">Post</button>
      @if (isEditing()) {
        <button type="button" (click)="onCancel()">Cancel</button>
      }
    </div>
  `,
})
export class CommentEditorUi {
  readonly content = input<string>('');
  readonly submitted = output<string>();
  readonly cancelled = output<void>();
  protected readonly draft = linkedSignal(() => this.content());

  protected isEditing(): boolean {
    return this.content() !== '';
  }

  protected onSubmit(): void {
    const body = this.draft().trim();
    if (!body) return;
    this.submitted.emit(body);
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }
}
```

The draft is local. Hoist to a store only if persistence across navigations matters.

**The dumb comment row v2.** `CommentUi` from [§Dumb components](#dumb-components) was display-only. Edit mode adds per-row interaction: two new inputs `[canEdit]` and `[canDelete]`, two new outputs `(edited)` and `(deleted)`, conditional buttons. The "can the current user edit this row?" question is answered once by the smart parent and passed down as a primitive boolean. Edit mode follows the same pattern: smart owns which row is being edited and swaps the editor in place of the row.

```diff:src/app/comments/comment.ui.ts
 @Component({
   selector: 'app-comment-ui',
   imports: [RelativeTimePipe],
   changeDetection: ChangeDetectionStrategy.OnPush,
   template: `
     <article>
       <header>
         <strong>{{ comment().author }}</strong>
         <time>{{ comment().createdAt | relativeTime }}</time>
       </header>
       <p>{{ comment().body }}</p>
+      @if (canEdit()) {
+        <button type="button" (click)="edited.emit()">Edit</button>
+      }
+      @if (canDelete()) {
+        <button type="button" (click)="deleted.emit()">Delete</button>
+      }
     </article>
   `,
 })
 export class CommentUi {
   readonly comment = input.required<Comment>();
+  readonly canEdit = input<boolean>(false);
+  readonly canDelete = input<boolean>(false);
+  readonly edited = output<void>();
+  readonly deleted = output<void>();
 }
```

**The smart parent additions.** `PostDetailFeat` from [§Smart components](#smart-components) handled load, list, loading/error/empty. v2 adds the editor primitive at the thread head, an `editingId` signal, identity-derived permissions, and the editor-swap branch inside the `@for`.

```diff:src/app/post-detail/post-detail.feat.ts
 @Component({
   selector: 'app-post-detail-feat',
-  imports: [CommentUi, SpinnerUi, ErrorBannerUi, DatePipe],
+  imports: [CommentUi, CommentEditorUi, SpinnerUi, ErrorBannerUi, DatePipe],
   providers: [CommentsState],
   changeDetection: ChangeDetectionStrategy.OnPush,
   template: `
     <article>...</article>

+    <section>
+      <app-comment-editor-ui
+        (submitted)="onAdd($event)"
+      />
+
     @if (comments.loading()) {
       <app-spinner-ui />
     } @else if (comments.error(); as message) {
       <app-error-banner-ui [message]="message" />
     } @else {
       @for (comment of comments.list(); track comment.id) {
-        <app-comment-ui [comment]="comment" />
+        @if (editingId() === comment.id) {
+          <app-comment-editor-ui
+            [content]="comment.body"
+            (submitted)="onSave(comment.id, $event)"
+            (cancelled)="onCancel()"
+          />
+        } @else {
+          <app-comment-ui
+            [comment]="comment"
+            [canEdit]="canEditComment(comment)"
+            [canDelete]="canDeleteComment(comment)"
+            (edited)="onEdit(comment.id)"
+            (deleted)="onDelete(comment.id)"
+          />
+        }
       } @empty {
         <p>No comments yet.</p>
       }
     }
+    </section>
   `,
 })
 export class PostDetailFeat {
   protected readonly post = inject(PostState).current;
   protected readonly comments = inject(CommentsState);
+  protected readonly editingId = signal<string | null>(null);
+  private readonly user = inject(CurrentUser);

   constructor() {
     this.comments.load(this.post().id);
   }
+
+  protected onAdd(body: string): void {
+    this.comments.add(this.post().id, body);
+  }
+
+  protected onCancel(): void {
+    this.editingId.set(null);
+  }
+
+  protected onEdit(id: string): void {
+    this.editingId.set(id);
+  }
+
+  protected onSave(id: string, body: string): void {
+    this.comments.edit(id, body);
+    this.editingId.set(null);
+  }
+
+  protected onDelete(id: string): void {
+    this.comments.remove(id);
+  }
+
+  protected canEditComment(comment: Comment): boolean {
+    return comment.author === this.user.name();
+  }
+
+  protected canDeleteComment(comment: Comment): boolean {
+    return comment.author === this.user.name();
+  }
 }
```

The smart parent decides four things in one place: when to fetch (constructor), who can edit and delete (per-row identity checks), which row is in edit mode (`editingId` signal), and what each event becomes — `add`, `edit`, `remove`. The dumb children never ask any of those questions — they emit intent, the parent translates. Loading, error, and empty are domain state owned by the smart side — `comments.loading()`, `comments.error()`, the `@empty` branch — and the dumb children render the variant the parent decides.

The state has smart-only consumers (rule 3), both dumb components inject nothing (rule 1), and the smart takes no inputs because it is the routed view — when reused off-route (see [§When features keep landing](#when-features-keep-landing)) it gains exactly one scope input, never data. The dumb children's i/o is the opposite: full data and intent surface on both sides.

## When features keep landing

The worked example assumes one smart consumer wires the comment thread. More than one? Photo detail wants comments. Profile activity wants comments. Each consumer would provide `CommentsState`, inject `CurrentUser`, repeat the editor + loop wiring with its own `subjectId`. When the thread grows a feature — pagination, reactions, mentions — every consumer's template grows with it. That repetition wants its own shell.

A smart shell wires the state, the dumb children, and the identity check once. It accepts a `[subjectId]` input so each consumer points it at the right thread. `CommentsState` provider moves inside the shell.

```text
┌────────────────────────────────┐ ┌────────────────────────────────┐
│         PostDetailFeat         │ │        PhotoDetailFeat         │
├────────────────────────────────┤ ├────────────────────────────────┤
│  injects PostState             │ │  injects PhotoState            │
│  renders CommentThreadFeat     │ │  renders CommentThreadFeat     │
└───────────────┬────────────────┘ └───────────────┬────────────────┘
                │                                  │
                │ [subjectId]                      │ [subjectId]
                │              ┌───────────────────┘
                │              │
                │              │
                ▼              ▼
┌────────────────────────────────┐                            ┌────────────────────────────────┐
│       CommentThreadFeat        │                            │         CommentsState          │
├────────────────────────────────┤  list()/loading()/error()  ├────────────────────────────────┤
│  provides CommentsState        │◀───────────────────────────│  signal<Comment[]>             │
│  injects CurrentUser           │───────────────────────────▶│  HTTP + optimistic mutation    │
│  local: editingId signal       │    add/edit/remove(id)     └────────────────────────────────┘
└────────────────────────────────┘
   │▲                           │▲
   ││                           ││
   ││ [content]                 ││ [comment] [canEdit] [canDelete]
   ││ (submitted) (cancelled)   ││ (edited) (deleted)
   ││                           ││
   ▼│                           ▼│
┌────────────────────────────┐ ┌────────────────────────────────┐
│      CommentEditorUi       │ │           CommentUi            │
├────────────────────────────┤ ├────────────────────────────────┤
│ input<string> content      │ │  input<Comment> comment        │
│ output<string> submitted   │ │  input<boolean> canEdit        │
│ output<void> cancelled     │ │  input<boolean> canDelete      │
│ local: draft               │ │  output<void> edited           │
└────────────────────────────┘ │  output<void> deleted          │
                               │  pure display, no local state  │
                               └────────────────────────────────┘
```

State + wiring slide one level down. Two consumers, one identical host line — `<app-comment-thread-feat [subjectId]="...">`. Each consumer gets its own `CommentThreadFeat` instance and its own `CommentsState`, sharing only through the HTTP service. `app-comment-ui` and `app-comment-editor-ui` stay primitives — pure, design-system-safe. `app-comment-thread-feat` is the wired version — drop-in for app code that has a `subjectId` to bind.

```ts:src/app/comments/comment-thread.feat.ts
@Component({
  selector: 'app-comment-thread-feat',
  imports: [CommentUi, CommentEditorUi, SpinnerUi, ErrorBannerUi],
  providers: [CommentsState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-comment-editor-ui
      (submitted)="onAdd($event)"
    />

    @if (comments.loading()) {
      <app-spinner-ui />
    } @else if (comments.error(); as message) {
      <app-error-banner-ui [message]="message" />
    } @else {
      @for (comment of comments.list(); track comment.id) {
        @if (editingId() === comment.id) {
          <app-comment-editor-ui
            [content]="comment.body"
            (submitted)="onSave(comment.id, $event)"
            (cancelled)="onCancel()"
          />
        } @else {
          <app-comment-ui
            [comment]="comment"
            [canEdit]="canEditComment(comment)"
            [canDelete]="canDeleteComment(comment)"
            (edited)="onEdit(comment.id)"
            (deleted)="onDelete(comment.id)"
          />
        }
      } @empty {
        <p>No comments yet.</p>
      }
    }
  `,
})
export class CommentThreadFeat {
  readonly subjectId = input.required<string>();
  protected readonly comments = inject(CommentsState);
  protected readonly editingId = signal<string | null>(null);
  private readonly user = inject(CurrentUser);

  constructor() {
    effect(() => this.comments.load(this.subjectId()));
  }

  protected onAdd(body: string): void {
    this.comments.add(this.subjectId(), body);
  }

  protected onCancel(): void {
    this.editingId.set(null);
  }

  protected onEdit(id: string): void {
    this.editingId.set(id);
  }

  protected onSave(id: string, body: string): void {
    this.comments.edit(id, body);
    this.editingId.set(null);
  }

  protected onDelete(id: string): void {
    this.comments.remove(id);
  }

  protected canEditComment(comment: Comment): boolean {
    return comment.author === this.user.name();
  }

  protected canDeleteComment(comment: Comment): boolean {
    return comment.author === this.user.name();
  }
}
```

`effect()` reloads the thread when `subjectId` changes — the same shell handles route changes without remounting. Each consumer collapses to one element:

```diff:src/app/post-detail/post-detail.feat.ts
 @Component({
   selector: 'app-post-detail-feat',
-  imports: [CommentUi, CommentEditorUi, SpinnerUi, ErrorBannerUi, DatePipe],
+  imports: [CommentThreadFeat, DatePipe],
-  providers: [CommentsState],
   changeDetection: ChangeDetectionStrategy.OnPush,
   template: `
     <article>...</article>
-
-    <section>
-      <app-comment-editor-ui
-        (submitted)="onAdd($event)"
-      />
-
-    @if (comments.loading()) {
-      <app-spinner-ui />
-    } @else if (comments.error(); as message) {
-      <app-error-banner-ui [message]="message" />
-    } @else {
-      @for (comment of comments.list(); track comment.id) {
-        @if (editingId() === comment.id) {
-          <app-comment-editor-ui
-            [content]="comment.body"
-            (submitted)="onSave(comment.id, $event)"
-            (cancelled)="onCancel()"
-          />
-        } @else {
-          <app-comment-ui
-            [comment]="comment"
-            [canEdit]="canEditComment(comment)"
-            [canDelete]="canDeleteComment(comment)"
-            (edited)="onEdit(comment.id)"
-            (deleted)="onDelete(comment.id)"
-          />
-        }
-      } @empty {
-        <p>No comments yet.</p>
-      }
-    }
-    </section>
+    <app-comment-thread-feat [subjectId]="post().id" />
   `,
 })
 export class PostDetailFeat {
   protected readonly post = inject(PostState).current;
-  protected readonly comments = inject(CommentsState);
-  protected readonly editingId = signal<string | null>(null);
-  private readonly user = inject(CurrentUser);
-
-  constructor() {
-    this.comments.load(this.post().id);
-  }
-
-  protected onAdd(body: string): void {
-    this.comments.add(this.post().id, body);
-  }
-
-  protected onCancel(): void {
-    this.editingId.set(null);
-  }
-
-  protected onEdit(id: string): void {
-    this.editingId.set(id);
-  }
-
-  protected onSave(id: string, body: string): void {
-    this.comments.edit(id, body);
-    this.editingId.set(null);
-  }
-
-  protected onDelete(id: string): void {
-    this.comments.remove(id);
-  }
-
-  protected canEditComment(comment: Comment): boolean {
-    return comment.author === this.user.name();
-  }
-
-  protected canDeleteComment(comment: Comment): boolean {
-    return comment.author === this.user.name();
-  }
 }
```

`PostDetailFeat` no longer knows about `CommentsState`, `CurrentUser`, or the editor wiring. A new thread feature edits one file instead of every consumer. Each `<app-comment-thread-feat>` provides its own state, so two threads on the same screen do not share data. To share a live signal across consumers (e.g. a sidebar count that mirrors the same thread), hoist the provider above both shells or move it to a higher route.

**Pays.** Three consumers or more, the thread grows beyond CRUD basics (mentions, reactions, threading, moderation), no outer code reads thread state.

**Flips.** Consumers must react to thread state from outside — a header badge counts pending comments, a sidebar mirrors the latest authors. The shell pattern stops fitting here. Hoist the state above all consumers (route-level provider or a store) and skip the shell — the encapsulation was the wrong shape for this case.

**One consumer breaks the contract? Duplicate.** Drop `<app-comment-thread-feat>` for that consumer, wire `<app-comment-ui>` + `<app-comment-editor-ui>` + `CommentsState` directly — the pre-shell shape. Others keep the shell. Outlier duplication beats warping the shell into a swiss-army knife.

**Multiple variants? Duplicate first, abstract later.** When divergence becomes systematic — different permissions, different moderation rules — drop the shell and move to abstract base class with `InjectionToken` polymorphism. But duplicate first — a wrong abstraction locks in a shape harder to undo than 3 copies of the code.

## The discipline

Two signs the cost is mounting: changes that should be local spread across files, and the same component picks up parents with diverging needs. Read these across a sprint or two, not a single PR. Without them, splitting is overhead.

Don't split when:

- **Small or early-stage application.** Limited surface, single team, no commitment that the codebase will grow — hackweek demo, internal tool, MVP. The boundary's payoff (predictable structure across many features and readers) needs scale to compound. Apply when growth arrives, not in anticipation.
- **Logic-light application.** The app might be large, but each feature is CRUD or display — no business-rule variants, no identity-driven UI, no role/mode/state branching. Smart's centralization payoff needs decisions to centralize. Without them, smart becomes a thin wrapper for nothing.
- **Low component reuse.** Most components render in exactly one place — every view is bespoke, primitives aren't shared across features. Dumb's reusability payoff requires consumers. Without them, the constraint adds files and contracts no one collects.

Once scale, business-logic depth, or shared primitives are in play, the payoff compounds. Dumb components reuse without dragging dependencies. Logic stops spreading because every business rule has one home. State stays single-sourced — behavior changes touch the smart parent only, the cross-file fan-out from the opening stops happening. Performance stays predictable — OnPush + signals contain rerenders to where data actually changed. Onboarding shrinks because each file owns one job.

Before any of this matters, ask: does this codebase actually need the boundary? Many don't. The split earns its tax in scale, in business-logic depth, in shared primitives. Without one of those, you're paying organization cost for organization no one will collect.

That is what the title means. **Smart when it pays** because the split is a tax until it isn't — once the component absorbs more than one concern, every named boundary is one less question to ask. A second contributor compounds the savings. **Dumb on purpose** because every dependency a dumb component does not have is one its hosts and refactors never have to carry. The deprivation is the design.
