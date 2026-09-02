import assert from "node:assert/strict";
import test from "node:test";
import { getSituationClassification } from "../app/v2/content.ts";
import {
  flowReducer,
  initialFlowState,
  normalizeFlowState,
} from "../app/v2/flow-machine.ts";

function reduce(state, ...actions) {
  return actions.reduce(flowReducer, state);
}

const input = [
  { type: "START" },
  { type: "UPDATE_DESCRIPTION", value: "TA说我答应的事又没做到" },
  { type: "SET_INTENSITY", value: "arguing" },
  { type: "SET_CHANNEL", value: "face-to-face" },
  { type: "COMPLETE_MICRO_ACTION", actionId: "input:capture" },
];

test("normal intensity merges the stop phrase into the speaking screen", () => {
  let state = reduce(initialFlowState, ...input);
  for (const [actionId, expected] of [
    ["body:face-to-face", "MICRO_ACTION_PHRASE"],
    ["phrase:arguing", "MICRO_ACTION_NEXT"],
    ["next:face-to-face", "REACTION_SELECT"],
  ]) {
    state = flowReducer(state, { type: "COMPLETE_MICRO_ACTION", actionId });
    assert.equal(state.stage, expected);
  }
});

test("losing-control has a shorter path and immediate channel-aware pause", () => {
  let state = reduce(
    initialFlowState,
    { type: "START" },
    { type: "UPDATE_DESCRIPTION", value: "已经快要控制不住" },
    { type: "SET_INTENSITY", value: "losing-control" },
    { type: "SET_CHANNEL", value: "face-to-face" },
    { type: "COMPLETE_MICRO_ACTION", actionId: "input:capture" },
  );
  assert.equal(state.stage, "MICRO_ACTION_BODY");
  state = flowReducer(state, { type: "CONTINUE_URGENT", actionId: "body:face-to-face" });
  assert.equal(state.stage, "MICRO_ACTION_PHRASE");
  state = flowReducer(state, { type: "COMPLETE_MICRO_ACTION", actionId: "phrase:losing-control" });
  assert.equal(state.stage, "REACTION_SELECT");

  const textState = {
    ...state,
    stage: "MICRO_ACTION_BODY",
    context: { ...state.context, channel: "text" },
  };
  assert.equal(flowReducer(textState, { type: "PREPARE_PAUSE" }).stage, "WECHAT_PAUSE");
});

test("all reactions map explicitly and crying asks before touch or distance", () => {
  const expected = {
    continue: "CONTINUE_LISTENING",
    agitated: "AGITATED_BRIDGE",
    crying: "CRYING_CHOICE",
    silent: "GIVE_SPACE",
    space: "GIVE_SPACE",
    wechat: "WECHAT_PAUSE",
  };
  for (const [reaction, stage] of Object.entries(expected)) {
    const result = flowReducer(
      { ...initialFlowState, stage: "REACTION_SELECT" },
      { type: "SELECT_REACTION", reaction },
    );
    assert.equal(result.stage, stage);
  }

  const crying = flowReducer(
    { ...initialFlowState, stage: "REACTION_SELECT" },
    { type: "SELECT_REACTION", reaction: "crying" },
  );
  assert.equal(flowReducer(crying, { type: "SET_CRYING_PREFERENCE", value: "space" }).stage, "GIVE_SPACE");
  assert.equal(flowReducer(crying, { type: "SET_CRYING_PREFERENCE", value: "unclear" }).stage, "STAY_NEARBY");
  assert.equal(flowReducer(crying, { type: "SET_CRYING_PREFERENCE", value: "closeness" }).stage, "PHYSICAL_CONNECTION");

  const agitated = flowReducer(
    { ...initialFlowState, stage: "REACTION_SELECT" },
    { type: "SELECT_REACTION", reaction: "agitated" },
  );
  assert.equal(agitated.stage, "AGITATED_BRIDGE");
  assert.equal(flowReducer(agitated, { type: "PREPARE_PAUSE" }).stage, "PAUSE_PREP");
});

test("physical connection remains optional and records the selected action", () => {
  let state = {
    ...initialFlowState,
    stage: "PHYSICAL_CONNECTION",
    context: {
      ...initialFlowState.context,
      physicalConnectionReturn: "DEESCALATION_CHECK",
    },
  };
  assert.equal(flowReducer(state, { type: "COMPLETE_PHYSICAL_CONNECTION" }), state);
  state = flowReducer(state, { type: "SELECT_PHYSICAL_CONNECTION", value: "embrace" });
  state = flowReducer(state, { type: "COMPLETE_PHYSICAL_CONNECTION" });
  assert.equal(state.stage, "DEESCALATION_CHECK");
  assert.equal(state.context.acuteInterventionCount, 1);
  assert.ok(state.context.completedActions.includes("physical:embrace"));
});

test("calmed and somewhat-calmed results have explicit completion paths", () => {
  const check = {
    ...initialFlowState,
    stage: "DEESCALATION_CHECK",
    context: { ...initialFlowState.context, acuteInterventionCount: 1 },
  };
  let calmed = flowReducer(check, { type: "SET_DEESCALATION", value: "calmed" });
  assert.equal(calmed.stage, "PHYSICAL_CONNECTION");
  calmed = flowReducer(calmed, { type: "SELECT_PHYSICAL_CONNECTION", value: "no-touch" });
  calmed = flowReducer(calmed, { type: "COMPLETE_PHYSICAL_CONNECTION" });
  assert.equal(calmed.stage, "ACUTE_COMPLETE");
  assert.equal(calmed.context.completionReason, "calmed");

  let partial = flowReducer(check, { type: "SET_DEESCALATION", value: "somewhat" });
  assert.equal(partial.stage, "MOOD_SHIFT_ACTIVITY");
  partial = flowReducer(partial, { type: "SELECT_MOOD_SHIFT", value: "short-walk" });
  partial = flowReducer(partial, { type: "COMPLETE_MOOD_SHIFT" });
  assert.equal(partial.stage, "ACUTE_COMPLETE");
  assert.equal(partial.context.completionReason, "closed-for-now");
  assert.ok(partial.context.completedActions.includes("mood-shift:short-walk"));

  const skipped = flowReducer(
    flowReducer(check, { type: "SET_DEESCALATION", value: "somewhat" }),
    { type: "SKIP_MOOD_SHIFT" },
  );
  assert.equal(skipped.stage, "CLOSE_FOR_NOW");
});

test("not-calmed permits at most one more acute intervention", () => {
  let state = {
    ...initialFlowState,
    stage: "DEESCALATION_CHECK",
    context: { ...initialFlowState.context, acuteInterventionCount: 1 },
  };
  state = flowReducer(state, { type: "SET_DEESCALATION", value: "not" });
  assert.equal(state.stage, "LISTENING_CAPACITY_CHECK");
  state = flowReducer(state, { type: "SET_LISTENING_CAPACITY", value: "can-listen" });
  assert.equal(state.stage, "REACTION_SELECT");
  state = flowReducer(state, { type: "SELECT_REACTION", reaction: "continue" });
  state = flowReducer(state, { type: "COMPLETE_REACTION_ACTION" });
  assert.equal(state.context.acuteInterventionCount, 2);
  state = flowReducer(state, { type: "SET_DEESCALATION", value: "not" });
  assert.equal(state.stage, "PAUSE_PREP");
});

test("pause readiness uses listening ability and returns to de-escalation check", () => {
  let state = flowReducer(initialFlowState, { type: "PREPARE_PAUSE" });
  state = flowReducer(state, { type: "BEGIN_PAUSE", at: 1000 });
  assert.equal(state.context.pauseReferenceMinutes, 20);
  state = flowReducer(state, { type: "CHECK_READINESS" });
  state = flowReducer(state, { type: "SET_READINESS", value: "not-ready" });
  assert.equal(state.stage, "PAUSE_MODE");
  assert.equal(state.context.readinessAttempts, 1);
  state = flowReducer(state, { type: "CHECK_READINESS" });
  state = flowReducer(state, { type: "SET_READINESS", value: "ready" });
  assert.equal(state.stage, "RETURN_TO_LISTENING");
  state = flowReducer(state, { type: "RETURN_AND_LISTEN" });
  assert.equal(state.stage, "DEESCALATION_CHECK");
  assert.equal(state.context.acuteInterventionCount, 2);
  state = flowReducer(state, { type: "SET_DEESCALATION", value: "not" });
  assert.equal(state.stage, "PAUSE_PREP");
});

test("invalid transitions remain inert", () => {
  assert.equal(flowReducer(initialFlowState, { type: "SELECT_REACTION", reaction: "crying" }), initialFlowState);
  assert.equal(flowReducer(initialFlowState, { type: "RETURN_AND_LISTEN" }), initialFlowState);
  assert.equal(flowReducer(initialFlowState, { type: "COMPLETE_PHYSICAL_CONNECTION" }), initialFlowState);
});

test("classifies only explicit surface signals and keeps a conservative fallback", () => {
  assert.equal(
    getSituationClassification("TA哭了，我不知道该怎么办", "arguing", "face-to-face").label,
    "TA正在哭",
  );
  assert.equal(
    getSituationClassification("我们还在微信里逐句争", "arguing", "text").label,
    "文字沟通正在升级",
  );
  assert.equal(
    getSituationClassification("我们有点不愉快", "tense", "face-to-face").label,
    "关系有些紧张",
  );
});

test("post-completion tools are optional and preserve their editable state", () => {
  const complete = {
    ...initialFlowState,
    stage: "ACUTE_COMPLETE",
    context: {
      ...initialFlowState.context,
      description: "我们刚才越说越急",
      completionReason: "closed-for-now",
    },
  };

  let deposit = flowReducer(complete, { type: "OPEN_RELATIONSHIP_DEPOSIT" });
  assert.equal(deposit.stage, "RELATIONSHIP_DEPOSIT");
  deposit = flowReducer(deposit, {
    type: "UPDATE_POSITIVE_NOTE",
    value: "我看见TA刚才还是愿意留下来听我说完",
  });
  deposit = flowReducer(deposit, { type: "SET_BOOKMARK_THEME", value: "sand" });
  deposit = flowReducer(deposit, { type: "SET_BOOKMARK_WAVE", value: 2 });
  assert.equal(deposit.context.positiveNote, "我看见TA刚才还是愿意留下来听我说完");
  assert.equal(deposit.context.bookmarkTheme, "sand");
  assert.equal(deposit.context.bookmarkWave, 2);

  const plan = flowReducer(deposit, { type: "OPEN_NEXT_TIME_PLAN" });
  assert.equal(plan.stage, "NEXT_TIME_PLAN");
  assert.equal(plan.context.positiveNote, deposit.context.positiveNote);
  assert.equal(flowReducer(complete, { type: "RESET" }).stage, "CALM_ENTRY");
});

test("legacy browser snapshots gain fields added by newer V2 builds", () => {
  const legacyContext = { ...initialFlowState.context };
  delete legacyContext.positiveNote;
  delete legacyContext.bookmarkTheme;
  delete legacyContext.bookmarkWave;
  delete legacyContext.repairDraft;

  const restored = normalizeFlowState({
    stage: "RELATIONSHIP_DEPOSIT",
    context: legacyContext,
  });

  assert.equal(restored.context.positiveNote, "");
  assert.equal(restored.context.bookmarkTheme, "tide");
  assert.equal(restored.context.bookmarkWave, 0);
  assert.deepEqual(restored.context.repairDraft, initialFlowState.context.repairDraft);
});
