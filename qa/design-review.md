# Location UI review

Sonnet 5.5 designed the location controls and independently reviewed desktop and mobile recaptures. After the final user-approved fix and verdict pass, its disposition is **ship**.

| Finding | Final score |
| --- | --- |
| Timezone tag contrast | Resolved |
| Chart and scene label collisions | Resolved |
| Coordinate placeholder clipping and ambiguity | Resolved |
| Native disclosure and datalist glyphs | Resolved |
| Prediction chip size | Resolved |
| Sheet scroll-edge cues | Resolved |
| Location design documentation | Resolved |
| Scroll fade dims the primary action | Resolved |

The override action row sits above the bottom scroll fade and below the top fade. The desktop and mobile recaptures show a full-contrast primary action at the bottom, with the action fading as it scrolls out at the top. Reopening an expanded sheet preserves the current-location card in view.

The final Sonnet reviewer reported two minor observations: an invisible desktop bottom scroll cue, and a possible hard clip of actions at the top edge. A subsequent implementation and browser check resolved both: a contrasting scrollbar reveals remaining content even when the fade covers empty space, and the top fade now paints above the action row. This follow-up was verified directly in Chromium at desktop and mobile widths, including shorter viewports that scroll the actions through the top edge; it was not another Sonnet review.

The reviewer could not confirm whether the mobile `6.1 ft` chart label is fully clear of the dashed baseline; this was not scored as a regression. The final verdict used the new desktop and mobile sheet screenshots, the prior desktop shot, and narrow CSS/documentation excerpts. It did not read the full chart/canvas implementation or tests or operate the page.

Implementation verification is recorded separately in [verification.txt](verification.txt). All 13 Node tests pass. Real phone input, Safari and assistive-technology output have not been checked.
