import XCTest
import SwiftTreeSitter
import TreeSitterTemplateToolkit

final class TreeSitterTemplateToolkitTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_template_toolkit())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading TemplateToolkit grammar")
    }
}
