(function($) {
    $.fn.shefuMultiSelectDropdown = function(options) {
        const defaults = {
            placeholder: 'Select Options',
            onChange: null,
        };
        
        const settings = $.extend({}, defaults, options);

        return this.each(function() {
            const $container = $(this);
            const $select = $container.find('select');
            const placeholder = $container.data('placeholder') || settings.placeholder;
            const dropdownId = 'shefu-dropdown_' + Math.random().toString(36).substr(2, 9);

            function createDropdown() {
                const $button = $('<button>', {
                    class: 'shefu-dropdown-btn',
                    text: placeholder,
                    'data-dropdown': dropdownId
                });

                const $dropdownContent = $('<div>', {
                    class: 'shefu-dropdown-content',
                    'data-dropdown': dropdownId
                });

                const $searchBox = $('<input>', {
                    type: 'text',
                    class: 'shefu-search-box',
                    placeholder: 'Search...'
                });

                const $selectAllOption = $('<div>', {
                    class: 'shefu-option',
                    'data-value': 'select-all'
                }).append(
                    $('<input>', {
                        type: 'checkbox',
                        id: `shefu-selectAll_${dropdownId}`
                    }),
                    $('<label>', {
                        text: 'Select All'
                    })
                );

                $dropdownContent.append($searchBox, $selectAllOption);

                // Create options
                $select.find('option').each(function() {
                    const $option = $('<div>', {
                        class: 'shefu-option',
                        'data-value': $(this).val()
                    }).append(
                        $('<input>', {
                            type: 'checkbox',
                            value: $(this).val()
                        }),
                        $('<label>', {
                            text: $(this).text()
                        })
                    );
                    $dropdownContent.append($option);
                });

                $select.hide();
                $container.append($button, $dropdownContent);
                return { $button, $dropdownContent, $selectAllOption, $searchBox };
            }

            const { $button, $dropdownContent, $selectAllOption, $searchBox } = createDropdown();
            const $optionDivs = $dropdownContent.find('.shefu-option:not(:first-child)');
            const $selectAllCheckbox = $selectAllOption.find('input[type="checkbox"]');

            // Modified handleSingleOption function
            function handleSingleOption() {
                if ($optionDivs.length === 1) {
                    // Get the single option and its checkbox
                    const $singleOption = $optionDivs.first();
                    const $checkbox = $singleOption.find('input[type="checkbox"]');
                    
                    // Check the checkbox and add selected class
                    $checkbox.prop('checked', true);
                    $singleOption.addClass('selected');
                    
                    // Update the button text immediately
                    $button.text($singleOption.find('label').text());
                    
                    // Hide select all option
                    $selectAllOption.hide();
                    
                    // Update the underlying select element
                    const value = $singleOption.data('value');
                    $select.val([value]);
                    
                    // Trigger change event
                    if (settings.onChange) {
                        settings.onChange([value]);
                    }
                }
            }

            // Call handleSingleOption immediately after dropdown creation
            setTimeout(handleSingleOption, 0);

            $searchBox.on('input', function() {
                const searchText = $(this).val().toLowerCase();
                $optionDivs.each(function() {
                    const optionText = $(this).find('label').text().toLowerCase();
                    $(this).toggleClass('hidden', !optionText.includes(searchText));
                });

                const visibleOptions = $optionDivs.not('.hidden').length;
                if (visibleOptions === 0) {
                    $selectAllOption.hide();
                } else if ($optionDivs.length > 1) {
                    $selectAllOption.show();
                }
            });

            $button.on('click', function(e) {
                e.stopPropagation();
                $('.shefu-dropdown-content').not(`[data-dropdown="${dropdownId}"]`).removeClass('show');
                $dropdownContent.toggleClass('show');
                if ($dropdownContent.hasClass('show')) {
                    $searchBox.focus();
                }
            });

            $(document).on('click', function(e) {
                if (!$(e.target).closest(`[data-dropdown="${dropdownId}"]`).length) {
                    $dropdownContent.removeClass('show');
                }
            });

            $dropdownContent.on('click', '.shefu-option', function(e) {
                const $checkbox = $(this).find('input[type="checkbox"]');
                const isSelectAll = $(this).data('value') === 'select-all';

                if (isSelectAll) {
                    const newState = !$selectAllCheckbox.prop('checked');
                    $selectAllCheckbox.prop('checked', newState);
                    $optionDivs.not('.hidden').find('input[type="checkbox"]').prop('checked', newState);
                    $optionDivs.not('.hidden').toggleClass('selected', newState);
                } else {
                    // If there's only one option, keep it checked
                    if ($optionDivs.length === 1) {
                        $checkbox.prop('checked', true);
                        $(this).addClass('selected');
                    } else {
                        $checkbox.prop('checked', !$checkbox.prop('checked'));
                        $(this).toggleClass('selected');
                    }
                    
                    const allVisibleChecked = $optionDivs.not('.hidden').find('input[type="checkbox"]:checked').length === $optionDivs.not('.hidden').length;
                    $selectAllCheckbox.prop('checked', allVisibleChecked);
                }

                updateButtonText();
                updateSelectElement();
            });

            function updateButtonText() {
                const $checkedBoxes = $optionDivs.find('input[type="checkbox"]:checked');
                const checkedCount = $checkedBoxes.length;

                if (checkedCount === 0) {
                    $button.text(placeholder);
                } else if (checkedCount === $optionDivs.length) {
                    $button.text('All Selected');
                } else if (checkedCount === 1) {
                    $button.text($checkedBoxes.first().closest('.shefu-option').find('label').text());
                } else {
                    $button.text(`${checkedCount} Selected`);
                }
            }

            function updateSelectElement() {
                const selectedValues = $optionDivs.find('input[type="checkbox"]:checked').map(function() {
                    return $(this).val();
                }).get();

                $select.val(selectedValues);
                $select.trigger('change');

                if (settings.onChange) {
                    settings.onChange(selectedValues);
                }
            }
        });
    };
})(jQuery);