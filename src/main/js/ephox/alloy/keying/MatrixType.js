define(
  'ephox.alloy.keying.MatrixType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.keying.KeyingTypes',
    'ephox.alloy.navigation.DomMovement',
    'ephox.alloy.navigation.DomPinpoint',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.alloy.navigation.MatrixNavigation',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, SystemEvents, EventHandler, KeyingType, KeyingTypes, DomMovement, DomPinpoint, KeyMatch, KeyRules, MatrixNavigation, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Fun, Option, Focus, SelectorFilter, SelectorFind) {
    var schema = [
      FieldSchema.field(
        'selectors',
        'selectors',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('row'),
          FieldSchema.strict('cell')
        ])
      ),
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute)
    ];

    var focusIn = function (component, matrixInfo) {
      var selectors = matrixInfo.selector();
      SelectorFind.descendant(component.element(), selectors.cell()).each(function (cell) {
        component.getSystem().triggerFocus(cell, component.element());  
      });
    };

    var execute = function (component, simulatedEvent, matrixInfo) {
      return Focus.search(component.element()).map(function (focused) {
        matrixInfo.execute()(component, simulatedEvent, focused);
        return true;
      });
    };

    var toMatrix = function (rows, matrixInfo) {
      return Arr.map(rows, function (row) {
        return SelectorFilter.descendants(row, matrixInfo.selectors().cell());
      });
    };
  
    var doMove = function (cycle) {
      return function (element, focused, matrixInfo) {
        return SelectorFind.closest(focused, matrixInfo.selectors().row()).bind(function (inRow) {
          var cellsInRow = SelectorFilter.descendants(inRow, matrixInfo.selectors().cell());
        
          return DomPinpoint.findIndex(cellsInRow, focused).bind(function (colIndex) {
            var allRows = SelectorFilter.descendants(element, matrixInfo.selectors().row());
            return DomPinpoint.findIndex(allRows, inRow).bind(function (rowIndex) {
              // Now, make the matrix.
              var matrix = toMatrix(allRows, matrixInfo);
              return cycle(matrix, rowIndex, colIndex).map(function (next) {
                return next.cell();
              });
            });
          });
        });
      };
    };

    var moveLeft = doMove(MatrixNavigation.cycleLeft);
    var moveRight = doMove(MatrixNavigation.cycleRight);
    
    var moveNorth = doMove(MatrixNavigation.cycleUp);
    var moveSouth = doMove(MatrixNavigation.cycleDown);

    var getRules = Fun.constant([
      KeyRules.rule( KeyMatch.inSet( Keys.LEFT() ), DomMovement.west(moveLeft, moveRight)),
      KeyRules.rule( KeyMatch.inSet( Keys.RIGHT() ), DomMovement.east(moveLeft, moveRight)),
      KeyRules.rule( KeyMatch.inSet( Keys.UP() ), DomMovement.north(moveNorth)),
      KeyRules.rule( KeyMatch.inSet( Keys.DOWN() ), DomMovement.south(moveSouth)),
      KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
    ]);

    var getEvents = Fun.constant({ });

    var getApis = Fun.constant({ });
    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.some(focusIn));
  }
);