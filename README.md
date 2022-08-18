# Go Five

![Demo](https://github.com/alexxuyaowen/gofive/blob/main/demo/demo.png)

- Allow multiple users to interact remotely in real time (expect maximum 2s of delay).
- Users can create and join a room to have private games, with Room 0 being the default public room.
  - An user can invite another person to join a room by either sending them an url link or giving them a room number.
  - To join a room, simply edit the room number by either directly click on it or pressing the space bar.
  - A room number is an integer between 0 and 99999999; any invalid room number will be converted to 0.
- Previous game is automatically resumed upon entering a room.
- Game is saved automatically on each move.
- Support keyboard interactions:
  - Press Left Arrow, Backspace, or 'b' to take back a move.
  - Press Escape, 'x', or 'c' to clear the board.
- Special sound effects will be played on each interaction.
- Speical animations will be played upon winning.

Try: https://alexxuyaowen.github.io/gofive/
