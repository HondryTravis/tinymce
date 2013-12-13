define(
  'ephox.snooker.ready.picker.Redimension',

  [
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.ready.data.Structs',
    'ephox.snooker.ready.picker.CellPosition',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Width',
    'global!Math'
  ],

  function (Event, Events, Structs, CellPosition, Height, Location, Width, Math) {
    return function (settings) {
      var events = Events.create({
        resize: Event(['grid'])
      });

      var active = false;

      var on = function () {
        active = true;
      };

      var off = function () {
        active = false;
      };

      var getDimensions = function (table) {
        var width = Width.get(table.element());
        var height = Height.get(table.element());
        return Structs.dimensions(width, height);
      };

      var getPosition = function (table) {
        var position = Location.absolute(table.element());
        return Structs.xy(position.left(), position.top());
      };

      var translate = function (cell, row, column) {
        return Structs.cell(cell.row() + row, cell.column() + column);
      };

      var validate = function (cell, minX, maxX, minY, maxY) {
        var col = Math.max(minX, Math.min(maxX, cell.column()));
        var row =  Math.max(minY, Math.min(maxY, cell.row()));
        return Structs.cell(row, col);
      };

      var handle = function (table, grid, x, y) {
        if (active) {
          var dimensions = getDimensions(table);
          var position = getPosition(table);
          var mouse = Structs.xy(x, y);
          var cell = CellPosition.findCell(position, dimensions, grid, mouse);
          var newSize = translate(cell, 1, 1);

          var selection = validate(newSize, 0, settings.maxCols, 0, settings.maxRows);
          var fullGrid = validate(translate(selection, 1, 1), settings.minCols, settings.maxCols, settings.minRows, settings.maxRows);

          if (fullGrid.row() !== grid.rows() || fullGrid.column() !== grid.columns()) {
            table.setSize(fullGrid.row(), fullGrid.column());
            events.trigger.resize(fullGrid);
          }
          
          table.setSelection(selection.row(), selection.column());
        }
      };

      return {
        on: on,
        off: off,
        handle: handle,
        events: events.registry
      };
    };

  }
);